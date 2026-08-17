#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрапер для https://www.vitaminy.kg

Собирает дерево категорий -> подкатегорий -> товаров, парсит карточки товаров
(название, описание, характеристики, применение, состав, отказ от ответственности,
цену) и скачивает картинки в локальную папку. Всё сохраняется в SQLite БД,
в которой для каждой картинки хранится точный локальный путь.

Запуск:
    python3 scraper.py [--workers N] [--only-categories] [--only-products]
                       [--only-images] [--limit N] [--fresh]
"""

import argparse
import asyncio
import json
import logging
import os
import random
import re
import sys
import time
from pathlib import Path

import aiohttp
from bs4 import BeautifulSoup

BASE_URL = "https://www.vitaminy.kg"
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
IMAGES_DIR = DATA_DIR / "images"
DB_PATH = DATA_DIR / "vitaminy.db"
LOG_PATH = DATA_DIR / "scraper.log"

log = logging.getLogger("scraper")

# Виртуальные корневые узлы вкладок. ID выбраны в заведомо не пересекающемся
# диапазоне с реальными id узлов/товаров сайта.
ROOT_CATEGORIES = 1_000_000_001
ROOT_SUPPLEMENTS = 1_000_000_002
ROOT_BRANDS = 1_000_000_003
ROOT_FOOD_ADDITIVES = 1_000_000_004

# Описание вкладок: (имя, ключ в menuData, root_id, url-префикс для сбора товаров)
TABS = [
    {
        "name": "categories",
        "menu_key": "catalog_categories",
        "root_id": ROOT_CATEGORIES,
        "url_prefix": "/ru/catalog/",
        "state_key": "ids_done_categories",
    },
    {
        "name": "supplements",
        "menu_key": "catalog_supplements",
        "root_id": ROOT_SUPPLEMENTS,
        "url_prefix": "/ru/catalog/",
        "state_key": "ids_done_supplements",
    },
    {
        "name": "brands",
        "menu_key": "brands",
        "root_id": ROOT_BRANDS,
        "url_prefix": "/ru/brands/",
        "state_key": "ids_done_brands",
    },
    {
        "name": "food_additives",
        "menu_key": "food_additives",
        "root_id": ROOT_FOOD_ADDITIVES,
        "url_prefix": "/ru/catalog/",
        "state_key": "ids_done_food_additives",
    },
]

# ---------------------------------------------------------------------------
# SQLite helpers
# ---------------------------------------------------------------------------


def get_conn():
    import sqlite3
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.execute("PRAGMA busy_timeout=30000")
    return conn
def init_db():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_conn()
    # Снимаем возможные блокировки после прерванного запуска
    try:
        conn.execute("PRAGMA wal_checkpoint(TRUNCATE)")
    except Exception:
        pass
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT,
            parent_id INTEGER,
            root_id INTEGER,
            products_count INTEGER DEFAULT 0,
            FOREIGN KEY (parent_id) REFERENCES categories(id)
        );


        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            specs TEXT,
            application TEXT,
            composition TEXT,
            disclaimer TEXT,
            price REAL,
            final_price REAL,
            url TEXT,
            product_code TEXT
        );

        CREATE TABLE IF NOT EXISTS product_categories (
            product_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (product_id, category_id),
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );


        CREATE TABLE IF NOT EXISTS product_images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            remote_url TEXT,
            local_path TEXT,
            is_main INTEGER DEFAULT 0,
            position INTEGER DEFAULT 0,
            FOREIGN KEY (product_id) REFERENCES products(id)
        );

        CREATE TABLE IF NOT EXISTS crawl_state (
            key TEXT PRIMARY KEY,
            value TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_cat_parent ON categories(parent_id);
        CREATE INDEX IF NOT EXISTS idx_pc_cat ON product_categories(category_id);
        CREATE INDEX IF NOT EXISTS idx_img_prod ON product_images(product_id);
        """
    )
    # Миграция: пересоздаём product_categories без FK на products,
    # т.к. связи создаются до появления товаров.
    cols = [r[1] for r in conn.execute("PRAGMA table_info(product_categories)")]
    if "product_id" in cols and "category_id" in cols:
        fks = conn.execute("PRAGMA foreign_key_list(product_categories)").fetchall()
        has_prod_fk = any(r[2] == "products" for r in fks)
        if has_prod_fk:
            conn.execute("DROP TABLE product_categories")
            conn.execute(
                """CREATE TABLE product_categories (
                    product_id INTEGER NOT NULL,
                    category_id INTEGER NOT NULL,
                    PRIMARY KEY (product_id, category_id),
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                )"""
            )
            conn.execute("CREATE INDEX IF NOT EXISTS idx_pc_cat ON product_categories(category_id)")

    # Миграция: добавляем колонку root_id, если её ещё нет (старые БД)
    cat_cols = [r[1] for r in conn.execute("PRAGMA table_info(categories)")]
    if "root_id" not in cat_cols:
        conn.execute("ALTER TABLE categories ADD COLUMN root_id INTEGER")
        # Существующие категории относим к вкладке «Категории»
        conn.execute(
            "UPDATE categories SET root_id = ? WHERE root_id IS NULL",
            (ROOT_CATEGORIES,),
        )
    # Проставляем root_id для узлов, у которых он ещё не задан (например, если
    # дерево было пересобрано старым кодом без root_id)
    conn.execute(
        "UPDATE categories SET root_id = ? WHERE root_id IS NULL AND id < 1000000000",
        (ROOT_CATEGORIES,),
    )

    # Создаём виртуальные корневые узлы вкладок (если их нет)
    root_defs = [
        (ROOT_CATEGORIES, "Категории", None),
        (ROOT_SUPPLEMENTS, "Пищевые добавки", None),
        (ROOT_BRANDS, "Бренды", None),
        (ROOT_FOOD_ADDITIVES, "Пищевые добавки (сводный)", None),
    ]
    for rid, rname, rslug in root_defs:
        conn.execute(
            "INSERT OR IGNORE INTO categories (id, name, slug, parent_id, root_id, products_count) "
            "VALUES (?, ?, ?, NULL, NULL, 0)",
            (rid, rname, rslug),
        )

    conn.commit()
    conn.close()




HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    ),
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}

# ---------------------------------------------------------------------------
# HTML -> JSON payload extraction (Next.js RSC)
# ---------------------------------------------------------------------------


def extract_json_payloads(html):
    """Извлекает все JSON-объекты из self.__next_f.push(...) скриптов."""
    payloads = []
    marker = 'self.__next_f.push([1,"'
    pos = 0
    while True:
        start = html.find(marker, pos)
        if start == -1:
            break
        content_start = start + len(marker)
        i = content_start
        buf = []
        while i < len(html):
            ch = html[i]
            if ch == "\\":
                if i + 1 < len(html):
                    buf.append(ch)
                    buf.append(html[i + 1])
                    i += 2
                    continue
                else:
                    buf.append(ch)
                    i += 1
                    continue
            if ch == '"':
                break
            buf.append(ch)
            i += 1
        raw = "".join(buf)
        try:
            decoded = json.loads('"' + raw + '"')
        except Exception:
            decoded = raw
        payloads.append(decoded)
        pos = i + 1
    return payloads


def find_json_in_payloads(payloads, key):
    """Ищет в payload-строках JSON-объект, содержащий ключ key."""
    for p in payloads:
        idx = p.find(f'"{key}":')
        if idx == -1:
            continue
        start = p.rfind("{", 0, idx)
        if start == -1:
            continue
        depth = 0
        in_str = False
        esc = False
        end = -1
        for i in range(start, len(p)):
            ch = p[i]
            if in_str:
                if esc:
                    esc = False
                elif ch == "\\":
                    esc = True
                elif ch == '"':
                    in_str = False
                continue
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end == -1:
            continue
        try:
            return json.loads(p[start:end])
        except Exception:
            continue
    return None


# ---------------------------------------------------------------------------
# Category tree
# ---------------------------------------------------------------------------

def parse_categories(html):
    """Возвращает список категорий (с детьми) из menuData.catalog_categories."""
    payloads = extract_json_payloads(html)
    menu = find_json_in_payloads(payloads, "menuData")
    if not menu:
        return []
    if "menuData" in menu:
        menu = menu["menuData"]
    cats = menu.get("catalog_categories") or []
    return cats


def flatten_categories(cats, parent_id=None):
    """Превращает вложенный список категорий в плоский список записей."""
    rows = []
    for c in cats:
        cid = c.get("id")
        name = c.get("name")
        slug = c.get("slug")
        count = c.get("products_count", 0)
        rows.append((cid, name, slug, parent_id, count))
        children = c.get("children") or []
        rows.extend(flatten_categories(children, cid))
    return rows


def save_categories(rows, root_id=None):
    """Сохраняет плоский список узлов дерева одной вкладки.

    Если root_id задан, узлы привязываются к виртуальному корню вкладки.
    Удаляются только узлы этой вкладки (по root_id) и их связи, чтобы не
    затирать деревья других вкладок.
    """
    conn = get_conn()
    if root_id is not None:
        # Удаляем связи товаров, привязанных к узлам этой вкладки
        conn.execute(
            "DELETE FROM product_categories WHERE category_id IN "
            "(SELECT id FROM categories WHERE root_id = ?)",
            (root_id,),
        )
        # Удаляем узлы вкладки (кроме виртуального корня)
        conn.execute(
            "DELETE FROM categories WHERE root_id = ? AND id != ?",
            (root_id, root_id),
        )
    else:
        # Полная пересборка (старое поведение)
        conn.execute("DELETE FROM product_categories")
        conn.execute("DELETE FROM product_images")
        conn.execute("DELETE FROM products")
        conn.execute("DELETE FROM categories")
    conn.executemany(
        "INSERT OR REPLACE INTO categories (id, name, slug, parent_id, root_id, products_count) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        [(r[0], r[1], r[2], r[3], root_id, r[4]) for r in rows],
    )
    conn.commit()
    conn.close()




# ---------------------------------------------------------------------------
# Product ids from category pages
# ---------------------------------------------------------------------------

def parse_product_ids_from_page(html):
    """Извлекает id товаров из страницы категории (ключ initialProducts)."""
    ids = set()
    payloads = extract_json_payloads(html)
    for p in payloads:
        idx = 0
        while True:
            idx = p.find('"initialProducts":[', idx)
            if idx == -1:
                break
            start = p.find("[", idx)
            depth = 0
            in_str = False
            esc = False
            end = -1
            for i in range(start, len(p)):
                ch = p[i]
                if in_str:
                    if esc:
                        esc = False
                    elif ch == "\\":
                        esc = True
                    elif ch == '"':
                        in_str = False
                    continue
                if ch == '"':
                    in_str = True
                elif ch == "[":
                    depth += 1
                elif ch == "]":
                    depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
            if end == -1:
                break
            try:
                arr = json.loads(p[start:end])
            except Exception:
                idx = end
                continue
            for item in arr:
                if isinstance(item, dict) and "id" in item:
                    ids.add(item["id"])
            idx = end
    # Также ищем ссылки /ru/products/<id>
    for m in re.finditer(r"/ru/products/(\d+)", html):
        ids.add(int(m.group(1)))
    return ids


def parse_pagination(html):
    """Извлекает информацию о пагинации из RSC-payload.

    Возвращает (total, page_size, current_page) или None, если не найдено.
    """
    payloads = extract_json_payloads(html)
    for p in payloads:
        # Ищем объект с total и page_size рядом с initialProducts
        for key in ("total", "page_size", "pageSize", "current_page", "currentPage"):
            idx = p.find(f'"{key}":')
            if idx == -1:
                continue
            start = p.rfind("{", 0, idx)
            if start == -1:
                continue
            depth = 0
            in_str = False
            esc = False
            end = -1
            for i in range(start, len(p)):
                ch = p[i]
                if in_str:
                    if esc:
                        esc = False
                    elif ch == "\\":
                        esc = True
                    elif ch == '"':
                        in_str = False
                    continue
                if ch == '"':
                    in_str = True
                elif ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
            if end == -1:
                continue
            try:
                obj = json.loads(p[start:end])
            except Exception:
                continue
            if isinstance(obj, dict) and ("total" in obj or "page_size" in obj):
                total = obj.get("total") or obj.get("total_count")
                page_size = obj.get("page_size") or obj.get("pageSize") or obj.get("per_page")
                current = obj.get("current_page") or obj.get("currentPage") or obj.get("page")
                return total, page_size, current
    return None


# ---------------------------------------------------------------------------
# Product card parsing
# ---------------------------------------------------------------------------

def clean_html(value):
    """Преобразует HTML-строку в текст."""
    if not value:
        return value
    if not isinstance(value, str):
        return value
    if "<" not in value:
        return value.strip()
    soup = BeautifulSoup(value, "html.parser")
    return soup.get_text(separator="\n").strip()


def _extract_object_at(p, start):
    """Извлекает JSON-объект из строки p, начиная с позиции start ('{')."""
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(p)):
        ch = p[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(p[start : i + 1])
                except Exception:
                    return None
    return None


def find_product_object(payloads, product_id):
    """Находит объект товара (содержит final_price и images) в payload-строках."""
    for p in payloads:
        idx = 0
        while True:
            idx = p.find('"final_price":', idx)
            if idx == -1:
                break
            search_from = idx
            while True:
                start = p.rfind("{", 0, search_from)
                if start == -1:
                    break
                obj = _extract_object_at(p, start)
                if obj and isinstance(obj, dict):
                    if "images" in obj and "name_ru" in obj:
                        return obj
                search_from = start
            idx += 1
    return None


def parse_product(html, product_id):
    """Извлекает данные товара из карточки."""
    payloads = extract_json_payloads(html)
    combined = "".join(payloads)
    data = find_product_object(payloads, product_id)
    if not data:
        return None

    name = data.get("name") or data.get("title")
    description = data.get("new_description_ru") or data.get("description_ru")
    application = data.get("application_ru")
    composition = data.get("composition_ru")
    disclaimer = data.get("disclaimer_ru")
    price = data.get("price")
    final_price = data.get("final_price")
    product_code = data.get("product_code") or data.get("code")
    url = data.get("url") or f"{BASE_URL}/ru/products/{product_id}"

    # Отказ от ответственности: если это RSC-ссылка ($XX) или пусто,
    # извлекаем из объединённого текста payload (combined)
    if not disclaimer or (isinstance(disclaimer, str) and disclaimer.startswith("$")):
        disclaimer = None
        for marker in ("Не является лекарственным средством", "Не является медицинским"):
            pos = combined.find(marker)
            if pos != -1:
                tail = combined[pos:]
                m = re.search(r"\d+:[A-Za-z0-9]+,\s*", tail)
                if m:
                    tail = tail[: m.start()]
                disclaimer = tail.strip()
                break

    # Характеристики: собираем из спецификаций и отдельных полей
    specs_parts = []
    specs = data.get("specifications_ru")
    if specs:
        if isinstance(specs, list):
            for s in specs:
                if isinstance(s, dict):
                    label = s.get("label") or s.get("name")
                    val = s.get("value")
                    if label and val:
                        specs_parts.append(f"{label}: {val}")
                else:
                    specs_parts.append(str(s))
        elif isinstance(specs, dict):
            for k, v in specs.items():
                specs_parts.append(f"{k}: {v}")

    def _field_text(val):
        if isinstance(val, dict):
            return val.get("name_ru") or val.get("name") or val.get("title")
        return val

    for field in ("product_type", "purpose", "who_is_it_for", "main_component", "country"):
        val = _field_text(data.get(field))
        if val:
            specs_parts.append(f"{field}: {val}")
    specs_text = "\n".join(specs_parts) if specs_parts else None

    # Картинки
    images = []
    raw_images = data.get("images") or []
    if isinstance(raw_images, list):
        for i, img in enumerate(raw_images):
            if isinstance(img, str):
                images.append({"url": img, "is_main": i == 0})
            elif isinstance(img, dict):
                url = img.get("image_l") or img.get("image_m") or img.get("image_s") or img.get("url")
                is_main = img.get("is_main", i == 0)
                if url:
                    images.append({"url": url, "is_main": bool(is_main)})

    return {
        "id": product_id,
        "name": clean_html(name),
        "description": clean_html(description),
        "specs": specs_text,
        "application": clean_html(application),
        "composition": clean_html(composition),
        "disclaimer": clean_html(disclaimer),
        "price": price,
        "final_price": final_price,
        "url": url,
        "product_code": product_code,
        "images": images,
    }


# ---------------------------------------------------------------------------
# Adaptive throttle controller
# ---------------------------------------------------------------------------

class Throttle:
    """Адаптивная регулировка темпа запросов.

    При появлении 429 увеличивает базовую задержку и снижает число воркеров,
    при стабильной работе — постепенно возвращает темп.
    """

    def __init__(self, base_workers):
        self.base_workers = max(1, base_workers)
        self.workers = self.base_workers
        self.base_delay = 0.4
        self.delay = self.base_delay
        self._clean_streak = 0

    def on_429(self):
        self.delay = min(self.delay * 2.0, 30.0)
        self.workers = max(1, self.workers - 1)
        self._clean_streak = 0
        log.warning("429: delay=%.1fs workers=%d", self.delay, self.workers)

    def on_success(self):
        self._clean_streak += 1
        if self._clean_streak >= 20 and self.delay > self.base_delay:
            self.delay = max(self.base_delay, self.delay * 0.8)
            self._clean_streak = 0
            log.info("throttle eased: delay=%.1fs workers=%d", self.delay, self.workers)
        if self._clean_streak >= 20 and self.workers < self.base_workers:
            self.workers += 1
            self._clean_streak = 0
            log.info("throttle eased: workers=%d", self.workers)

    def sleep(self):
        return _jitter(self.delay)


# ---------------------------------------------------------------------------
# HTTP fetching
# ---------------------------------------------------------------------------

def _jitter(base):
    """Возвращает время ожидания с небольшим случайным разбросом."""
    return base + random.uniform(0.3, 1.5)



async def fetch(session, url, throttle=None, retries=6, timeout=45, no_retry_500=False):
    """GET с ретраями на 429/5xx и обработкой Retry-After.

    Возвращает (html, status). При исчерпании ретраев возвращает (None, status).
    Если no_retry_500=True, то 500 возвращается сразу без ретраев (используется
    для страниц пагинации, где 500 означает конец списка).
    """
    last_status = None
    for attempt in range(retries):
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                last_status = resp.status
                if resp.status == 200:
                    if throttle:
                        throttle.on_success()
                    return await resp.text(), resp.status
                if resp.status == 500 and no_retry_500:
                    return None, resp.status
                if resp.status in (429, 500, 502, 503, 504):
                    if resp.status == 429 and throttle:
                        throttle.on_429()
                    wait = 2 ** attempt + 1
                    retry_after = resp.headers.get("Retry-After")
                    if retry_after:
                        try:
                            wait = max(wait, int(retry_after))
                        except ValueError:
                            pass
                    wait = _jitter(wait)
                    log.warning("[retry %d/%d] %s %s (wait %.1fs)", attempt + 1, retries, resp.status, url, wait)
                    await asyncio.sleep(wait)
                    continue
                log.warning("[skip] %s %s", resp.status, url)
                return None, resp.status
        except (aiohttp.ClientError, asyncio.TimeoutError) as e:
            last_status = None
            wait = _jitter(2 ** attempt + 1)
            log.warning("[retry %d/%d] %s %s (wait %.1fs)", attempt + 1, retries, type(e).__name__, url, wait)
            await asyncio.sleep(wait)
    return None, last_status




async def fetch_bytes(session, url, throttle=None, retries=6, timeout=90):
    """GET байтов (картинки) с ретраями. Возвращает (data, content_type)."""
    for attempt in range(retries):
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=timeout)) as resp:
                if resp.status == 200:
                    if throttle:
                        throttle.on_success()
                    data = await resp.read()
                    ctype = resp.headers.get("Content-Type", "")
                    return data, ctype
                if resp.status in (429, 500, 502, 503, 504):
                    if resp.status == 429 and throttle:
                        throttle.on_429()
                    wait = _jitter(2 ** attempt + 1)
                    await asyncio.sleep(wait)
                    continue
                return None, ""
        except (aiohttp.ClientError, asyncio.TimeoutError):
            await asyncio.sleep(_jitter(2 ** attempt + 1))
    return None, ""



def ext_from_content_type(ctype, url):
    """Определяет расширение файла по Content-Type или URL."""
    ctype = (ctype or "").lower()
    mapping = {
        "image/jpeg": ".jpg",
        "image/jpg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/avif": ".avif",
        "image/svg+xml": ".svg",
    }
    for k, v in mapping.items():
        if k in ctype:
            return v
    # Fallback: по расширению в URL
    ext = os.path.splitext(url.split("?")[0])[1].lower()
    if ext in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"):
        return ext
    return ".jpg"


# ---------------------------------------------------------------------------
# Workers
# ---------------------------------------------------------------------------

def parse_menu(html):
    """Возвращает menuData (словарь) из главной страницы."""
    payloads = extract_json_payloads(html)
    menu = find_json_in_payloads(payloads, "menuData")
    if not menu:
        return {}
    if "menuData" in menu:
        menu = menu["menuData"]
    return menu


async def fetch_trees(session, fresh=False):
    """Собирает деревья вкладок (категории, добавки, бренды, сводные добавки).

    Данные берутся из одного menuData главной страницы. Каждое дерево
    привязывается к своему виртуальному корню (root_id).

    При fresh=True пересобираются все вкладки. Иначе — только те, которых ещё
    нет в БД (чтобы не сбрасывать связи товаров существующих вкладок).
    """
    print("Сбор деревьев вкладок...")
    html, _ = await fetch(session, BASE_URL)
    if not html:
        print("Не удалось получить главную страницу")
        return

    menu = parse_menu(html)
    if not menu:
        print("menuData не найден")
        return

    conn = get_conn()
    existing = {
        r["root_id"]
        for r in conn.execute(
            "SELECT DISTINCT root_id FROM categories WHERE root_id IS NOT NULL"
        )
    }
    conn.close()

    for tab in TABS:
        if not fresh and tab["root_id"] in existing:
            log.info("Вкладка %s уже есть, пропускаю", tab["name"])
            continue
        nodes = menu.get(tab["menu_key"]) or []
        if not nodes:
            log.warning("Вкладка %s: узлы не найдены (ключ %s)", tab["name"], tab["menu_key"])
            continue
        rows = flatten_categories(nodes)
        save_categories(rows, root_id=tab["root_id"])
        print(f"  {tab['name']}: сохранено узлов {len(rows)}")



async def collect_product_ids(session, throttle, tabs=None):
    """Собирает id всех товаров по листовым узлам выбранных вкладок.

    Связи товар-узел сохраняются инкрементально после каждого узла, поэтому
    прерванный прогон можно продолжить с того же места. Чекпойнт ведётся
    отдельно для каждой вкладки (crawl_state.ids_done_<tab>).
    """
    if tabs is None:
        tabs = [t["name"] for t in TABS]

    all_ids = set()
    sem = asyncio.Semaphore(throttle.workers)

    async def process_node(node):
        nid, slug = node["id"], node["slug"]
        page = 1
        local_ids = set()
        while True:
            url = f"{BASE_URL}{node['url_prefix']}{slug}?page={page}"
            async with sem:
                # 500 на странице > 1 — признак конца пагинации (сервер отдаёт 500
                # вместо пустого списка), поэтому не ретраим такие страницы.
                html, status = await fetch(
                    session, url, throttle=throttle, no_retry_500=(page > 1)
                )
            if not html:
                if status == 500 and page > 1:
                    log.info("узел %s: конец пагинации на page=%s (500)", slug, page)
                break

            ids = parse_product_ids_from_page(html)
            if not ids:
                break
            # Если все id уже собраны на этой странице — значит, дальше дубли
            new_ids = ids - local_ids
            if not new_ids:
                break
            local_ids.update(ids)
            # Пагинация: если знаем total и page_size, считаем число страниц
            pag = parse_pagination(html)
            if pag:
                total, page_size, _ = pag
                if total and page_size:
                    total_pages = (total + page_size - 1) // page_size
                    if page >= total_pages:
                        break
            page += 1
            if page > 500:
                break
            await asyncio.sleep(throttle.sleep())
        return nid, local_ids

    for tab in TABS:
        if tab["name"] not in tabs:
            continue
        conn = get_conn()
        # Листовые узлы вкладки (без детей внутри этой вкладки)
        leaf_nodes = conn.execute(
            """SELECT c.id, c.slug, ? AS url_prefix
               FROM categories c
               WHERE c.root_id = ?
                 AND c.id NOT IN (
                     SELECT DISTINCT parent_id FROM categories
                     WHERE parent_id IS NOT NULL AND root_id = ?
                 )""",
            (tab["url_prefix"], tab["root_id"], tab["root_id"]),
        ).fetchall()
        # Уже обработанные узлы этой вкладки
        done_rows = conn.execute(
            "SELECT value FROM crawl_state WHERE key = ?", (tab["state_key"],)
        ).fetchall()
        conn.close()
        done = set()
        for r in done_rows:
            for part in r["value"].split(","):
                if part.strip():
                    done.add(int(part.strip()))

        todo = [n for n in leaf_nodes if n["id"] not in done]
        print(
            f"Вкладка {tab['name']}: узлов для обхода {len(todo)} "
            f"(всего листовых {len(leaf_nodes)}, обработано {len(leaf_nodes) - len(todo)})"
        )

        # Обрабатываем узлы батчами, сохраняя чекпойнт после каждого
        for i in range(0, len(todo), throttle.workers):
            batch = todo[i : i + throttle.workers]
            results = await asyncio.gather(*[process_node(n) for n in batch])

            conn = get_conn()
            for nid, ids in results:
                for pid in ids:
                    conn.execute(
                        "INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)",
                        (pid, nid),
                    )
                all_ids.update(ids)
                done.add(nid)
                conn.execute(
                    "INSERT OR REPLACE INTO crawl_state (key, value) VALUES (?, ?)",
                    (tab["state_key"], ",".join(str(x) for x in sorted(done))),
                )
            conn.commit()
            conn.close()
            log.info(
                "id-сбор %s: %d/%d узлов",
                tab["name"],
                min(i + len(batch), len(todo)),
                len(todo),
            )

    print(f"Уникальных товаров найдено: {len(all_ids)}")
    return all_ids




async def process_product(session, product_id, sem, throttle):
    """Скачивает карточку товара и сохраняет в БД."""
    url = f"{BASE_URL}/ru/products/{product_id}"
    async with sem:
        html, _ = await fetch(session, url, throttle=throttle)
    if not html:
        return False

    data = parse_product(html, product_id)
    if not data:
        log.warning("[warn] не удалось распарсить товар %s", product_id)
        return False


    conn = get_conn()
    conn.execute(
        """INSERT OR REPLACE INTO products
           (id, name, description, specs, application, composition, disclaimer,
            price, final_price, url, product_code)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            data["id"], data["name"], data["description"], data["specs"],
            data["application"], data["composition"], data["disclaimer"],
            data["price"], data["final_price"], data["url"], data["product_code"],
        ),
    )
    # Сохраняем записи о картинках (URL), файлы скачаются на этапе 3
    conn.execute("DELETE FROM product_images WHERE product_id = ?", (product_id,))
    for pos, img in enumerate(data["images"]):
        url = img["url"]
        if not url:
            continue
        if url.startswith("//"):
            url = "https:" + url
        elif url.startswith("/"):
            url = BASE_URL + url
        conn.execute(
            "INSERT INTO product_images (product_id, remote_url, local_path, is_main, position) "
            "VALUES (?, ?, NULL, ?, ?)",
            (product_id, url, 1 if img["is_main"] else 0, pos),
        )
    conn.commit()
    conn.close()
    return True


async def download_images_for(session, product_id, sem, throttle):
    """Скачивает файлы картинок для товара по записям из БД.

    Сначала скачивает все картинки (сетевые запросы), затем одним коротким
    соединением обновляет локальные пути в БД. Это избегает длительных
    транзакций и блокировок при параллельной работе воркеров.
    """
    conn = get_conn()
    rows = conn.execute(
        "SELECT * FROM product_images WHERE product_id = ? AND local_path IS NULL",
        (product_id,),
    ).fetchall()
    conn.close()
    if not rows:
        return

    prod_dir = IMAGES_DIR / str(product_id)
    prod_dir.mkdir(parents=True, exist_ok=True)

    # Этап 1: скачиваем все картинки (без открытой транзакции БД)
    updates = []  # (local_path, row_id)
    for row in rows:
        url = row["remote_url"]
        if not url:
            continue
        async with sem:
            data, ctype = await fetch_bytes(session, url, throttle=throttle)
        if not data:
            continue
        ext = ext_from_content_type(ctype, url)
        local_path = prod_dir / f"{row['position']}{ext}"
        local_path.write_bytes(data)
        updates.append((str(local_path), row["id"]))

    # Этап 2: короткая транзакция для обновления путей
    if updates:
        conn = get_conn()
        try:
            conn.executemany(
                "UPDATE product_images SET local_path = ? WHERE id = ?",
                updates,
            )
            conn.commit()
        finally:
            conn.close()




# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------

async def run(args):
    init_db()

    throttle = Throttle(args.workers)
    connector = aiohttp.TCPConnector(limit=args.workers, limit_per_host=args.workers, ttl_dns_cache=300)
    async with aiohttp.ClientSession(headers=HEADERS, connector=connector) as session:
        # --- Этап 0: деревья вкладок ---
        conn = get_conn()
        cat_count = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
        conn.close()

        if cat_count == 0 or args.fresh:
            # Полная пересборка всех деревьев
            await fetch_trees(session, fresh=True)
        else:
            # Дополняем недостающие вкладки (не трогая существующие связи)
            await fetch_trees(session, fresh=False)


        if args.only_categories:
            print_report()
            return

        # --- Этап 1: сбор id товаров по листовым узлам вкладок ---
        # Всегда дособираем недостающие связи (по чекпойнтам вкладок), чтобы
        # новые вкладки добавлялись к уже существующим без повторного сбора.
        # При --only-images id не нужны — используем товары из БД.
        if args.only_images:
            conn = get_conn()
            all_ids = set(r[0] for r in conn.execute("SELECT DISTINCT product_id FROM product_categories"))
            conn.close()
            log.info("only-images: используем %s товаров из БД", len(all_ids))
        else:
            all_ids = await collect_product_ids(session, throttle, tabs=args.tabs)



        if args.limit:
            all_ids = sorted(all_ids)[: args.limit]

        # --- Этап 2: парсинг карточек ---
        conn = get_conn()
        existing = set(r[0] for r in conn.execute("SELECT id FROM products"))
        conn.close()
        todo = [pid for pid in all_ids if pid not in existing]
        log.info("Товаров к обработке: %s (уже есть: %s)", len(todo), len(all_ids) - len(todo))

        sem = asyncio.Semaphore(throttle.workers)

        if not args.only_images:
            done = 0
            for i in range(0, len(todo), throttle.workers):
                batch = todo[i : i + throttle.workers]
                results = await asyncio.gather(
                    *[process_product(session, pid, sem, throttle) for pid in batch]
                )
                done += sum(1 for r in results if r)
                log.info("карточки: %s/%s", done, len(todo))
                await asyncio.sleep(throttle.sleep())

        # --- Этап 3: скачивание картинок ---
        if not args.only_products:
            conn = get_conn()
            products = conn.execute("SELECT id FROM products").fetchall()
            conn.close()
            log.info("Скачивание картинок для %s товаров...", len(products))
            img_done = 0
            for i in range(0, len(products), throttle.workers):
                batch = products[i : i + throttle.workers]
                await asyncio.gather(
                    *[download_images_for(session, p["id"], sem, throttle) for p in batch]
                )
                img_done += len(batch)
                if img_done % 50 == 0 or img_done == len(products):
                    log.info("картинки: %s/%s", img_done, len(products))
                await asyncio.sleep(throttle.sleep())

    print_report()




def print_report():
    conn = get_conn()
    cats = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
    prods = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    imgs = conn.execute("SELECT COUNT(*) FROM product_images").fetchone()[0]
    links = conn.execute("SELECT COUNT(*) FROM product_categories").fetchone()[0]
    # Счётчики по вкладкам (без виртуальных корней)
    tab_counts = {}
    for tab in TABS:
        n = conn.execute(
            "SELECT COUNT(*) FROM categories WHERE root_id = ?", (tab["root_id"],)
        ).fetchone()[0]
        tab_counts[tab["name"]] = n
    conn.close()
    print("\n===== ОТЧЁТ =====")
    print(f"Узлов деревьев: {cats}")
    for name, n in tab_counts.items():
        print(f"  {name}: {n}")
    print(f"Товаров: {prods}")
    print(f"Картинок: {imgs}")
    print(f"Связей товар-узел: {links}")
    print(f"БД: {DB_PATH}")
    print(f"Картинки: {IMAGES_DIR}")



def main():
    parser = argparse.ArgumentParser(description="Скрапер vitaminy.kg")
    parser.add_argument("--workers", type=int, default=3, help="Число параллельных запросов")
    parser.add_argument("--only-categories", action="store_true", help="Только собрать категории")
    parser.add_argument("--only-products", action="store_true", help="Только собрать товары (без картинок)")
    parser.add_argument("--only-images", action="store_true", help="Только скачать картинки")
    parser.add_argument("--limit", type=int, default=None, help="Ограничить число товаров")
    parser.add_argument("--fresh", action="store_true", help="Пересобрать всё с нуля")
    parser.add_argument(
        "--tabs",
        type=str,
        default=None,
        help="Вкладки для сбора товаров через запятую: "
        "categories,supplements,brands,food_additives (по умолчанию все)",
    )
    args = parser.parse_args()

    if args.tabs:
        valid = {t["name"] for t in TABS}
        args.tabs = [t.strip() for t in args.tabs.split(",") if t.strip()]
        unknown = [t for t in args.tabs if t not in valid]
        if unknown:
            parser.error(f"Неизвестные вкладки: {unknown}. Допустимые: {sorted(valid)}")
    else:
        args.tabs = None


    # Настройка логирования: в консоль и в файл
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler(LOG_PATH, encoding="utf-8"),
        ],
    )

    asyncio.run(run(args))



if __name__ == "__main__":
    main()

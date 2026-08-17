#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Проверка функциональности скрапера: парсит карточку товара с живого сайта
и сравнивает все поля с тем, что лежит в БД.

Запуск:
    python3 check_scraper.py [--ids 1286,1306]
"""
import argparse
import asyncio
import json
import sqlite3

import aiohttp

from scraper import (
    BASE_URL,
    DB_PATH,
    HEADERS,
    parse_product,
)


def get_conn():
    conn = sqlite3.connect(DB_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


async def fetch_html(session, url):
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=45)) as resp:
        return await resp.text(), resp.status


async def check(ids):
    conn = get_conn()
    async with aiohttp.ClientSession(headers=HEADERS) as session:
        for pid in ids:
            row = conn.execute(
                "SELECT * FROM products WHERE id = ?", (pid,)
            ).fetchone()
            if not row:
                print(f"\n[ID {pid}] нет в БД")
                continue
            url = f"{BASE_URL}/ru/products/{pid}"
            html, status = await fetch_html(session, url)
            if not html or status != 200:
                print(f"\n[ID {pid}] fetch status={status}")
                continue
            parsed = parse_product(html, pid)
            if parsed is None:
                print(f"\n[ID {pid}] НЕ УДАЛОСЬ распарсить")
                continue

            imgs_bd = conn.execute(
                "SELECT COUNT(*) c FROM product_images WHERE product_id = ?", (pid,)
            ).fetchone()["c"]

            print(f"\n{'='*70}\n[ID {pid}] {row['name']}\n{'='*70}")
            print(f"  URL: {parsed['url']}")
            print(f"  name         : {json.dumps(parsed['name'], ensure_ascii=False)}")
            print(f"  price        : {parsed['price']}  (БД: {row['price']})")
            print(f"  final_price  : {parsed['final_price']}  (БД: {row['final_price']})")
            print(f"  product_code : {parsed['product_code']}  (БД: {row['product_code']})")
            print(f"  description  : {len(parsed['description'])} симв.  (БД: {len(row['description'] or '')})")
            print(f"  specs        : {len(parsed['specs'] or '')} симв.  (БД: {len(row['specs'] or '')})")
            print(f"  application  : {len(parsed['application'] or '')} симв.  (БД: {len(row['application'] or '')})")
            print(f"  composition  : {len(parsed['composition'] or '')} симв.  (БД: {len(row['composition'] or '')})")
            print(f"  disclaimer   : {len(parsed['disclaimer'] or '')} симв.  (БД: {len(row['disclaimer'] or '')})")
            print(f"  картинок на сайте: {len(parsed['images'])}  (БД: {imgs_bd})")
            if parsed["images"]:
                print(f"  первая картинка: {parsed['images'][0]['url'][:90]}")
            # Фрагмент описания для наглядности
            if parsed["description"]:
                print(f"  фрагмент описания: {parsed['description'][:120]!r}")
    conn.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ids", type=str, default="1286,2429")
    args = parser.parse_args()
    ids = [int(x) for x in args.ids.split(",") if x.strip()]
    asyncio.run(check(ids))


if __name__ == "__main__":
    main()

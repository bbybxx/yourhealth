#!/usr/bin/env node
// Экспорт данных из SQLite БД скрапера в JSON + копирование изображений в public/.
// Запуск: node scripts/export-data.mjs
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, copyFileSync, writeFileSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = join(__dirname, '..');
const SCRAPER_ROOT = join(SITE_ROOT, '..', 'scraper');
const DB_PATH = join(SCRAPER_ROOT, 'data', 'vitaminy.db');
const SRC_IMAGES = join(SCRAPER_ROOT, 'data', 'images');
const DATA_OUT = join(SITE_ROOT, 'data');
const PUBLIC_IMAGES = join(SITE_ROOT, 'public', 'images');

const ROOTS = {
  categories: 1_000_000_001,
  supplements: 1_000_000_002,
  brands: 1_000_000_003,
  food_additives: 1_000_000_004,
};

// ---------------------------------------------------------------------------
// Умножение цен: случайный (но стабильный для каждого товара) множитель 2.1–2.85
// ---------------------------------------------------------------------------
const PRICE_MULTIPLY = (process.env.PRICE_MULTIPLY ?? "1") === "1";
const PRICE_MIN = 2.1;
const PRICE_MAX = 2.85;

// Детерминированный генератор по id товара — цены не «прыгают» между запусками
function seededUnit(seed) {
  const x = Math.sin(seed * 7919.0) * 10000;
  return x - Math.floor(x);
}

function priceMultiplier(productId) {
  return PRICE_MIN + seededUnit(productId) * (PRICE_MAX - PRICE_MIN);
}


const TABS = [
  { id: ROOTS.categories, name: 'Категории', slug: 'categories' },
  { id: ROOTS.supplements, name: 'Пищевые добавки', slug: 'supplements' },
  { id: ROOTS.brands, name: 'Бренды', slug: 'brands' },
  { id: ROOTS.food_additives, name: 'Пищевые добавки (сводный)', slug: 'food-additives' },
];

// ---------------------------------------------------------------------------
// Очистка «мусорных» вхождений (артефакты парсинга вида $2c, 2c:T9e3, ...)
// ---------------------------------------------------------------------------
function cleanText(value) {
  if (value == null) return '';
  let s = String(value);
  s = s.replace(/\u00a0/g, ' ');
  // вырезать целые строки-мусор вида 2c:xxxx или $2c
  s = s.replace(/^\s*(?:[\d]{1,3}[a-z]:\w+|[$][\d]?[a-z0-9]+)\s*$/gim, '');
  s = s.replace(/\$\d?[a-z]{1,3}\b/gi, '');
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

function parseSpecs(raw) {
  if (!raw) return [];
  const lines = cleanText(raw).split('\n');
  const out = [];
  for (const line of lines) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) out.push({ key, value });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Чтение БД
// ---------------------------------------------------------------------------
const db = new DatabaseSync(DB_PATH, { readOnly: true });

const categories = db.prepare(
  'SELECT id, name, slug, parent_id, root_id, products_count FROM categories'
).all().map((r) => ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  parent_id: r.parent_id,
  root_id: r.root_id,
  products_count: r.products_count || 0,
}));

const productsRaw = db.prepare('SELECT * FROM products').all();

const prodCatsRaw = db.prepare('SELECT product_id, category_id FROM product_categories').all();
const prodToCats = new Map();
for (const r of prodCatsRaw) {
  if (!prodToCats.has(r.product_id)) prodToCats.set(r.product_id, []);
  prodToCats.get(r.product_id).push(r.category_id);
}

const imgRaw = db.prepare('SELECT * FROM product_images ORDER BY is_main DESC, position ASC').all();
const prodToImages = new Map();
for (const r of imgRaw) {
  if (!prodToImages.has(r.product_id)) prodToImages.set(r.product_id, []);
  prodToImages.get(r.product_id).push({
    remote_url: r.remote_url,
    local_path: r.local_path,
    is_main: !!r.is_main,
    position: r.position,
  });
}

const brandCats = new Map(
  categories.filter((c) => c.root_id === ROOTS.brands).map((c) => [c.id, c.name])
);

// ---------------------------------------------------------------------------
// Копирование изображений
// ---------------------------------------------------------------------------
console.log('Копирование изображений...');
if (existsSync(PUBLIC_IMAGES)) rmSync(PUBLIC_IMAGES, { recursive: true, force: true });
mkdirSync(PUBLIC_IMAGES, { recursive: true });
let copied = 0;
let skipped = 0;
if (existsSync(SRC_IMAGES)) {
  for (const pidDir of readdirSync(SRC_IMAGES, { withFileTypes: true })) {
    if (!pidDir.isDirectory()) continue;
    const srcDir = join(SRC_IMAGES, pidDir.name);
    const outDir = join(PUBLIC_IMAGES, pidDir.name);
    mkdirSync(outDir, { recursive: true });
    for (const f of readdirSync(srcDir)) {
      const ext = extname(f).toLowerCase();
      if (!['.avif', '.webp', '.jpg', '.jpeg', '.png'].includes(ext)) continue;
      try {
        copyFileSync(join(srcDir, f), join(outDir, f));
        copied++;
      } catch {
        skipped++;
      }
    }
  }
}
console.log(`  скопировано: ${copied}, пропущено: ${skipped}`);

// ---------------------------------------------------------------------------
// Сборка товаров
// ---------------------------------------------------------------------------
const products = productsRaw.map((p) => {
  const catIds = prodToCats.get(p.id) || [];
  let brand = null;
  for (const cid of catIds) {
    if (brandCats.has(cid)) {
      brand = brandCats.get(cid);
      break;
    }
  }
  let manufacturer = brand;
  if (!manufacturer && p.name) {
    const head = p.name.split(',')[0].trim();
    if (head.length >= 3 && head.length <= 40) manufacturer = head;
  }

  const images = (prodToImages.get(p.id) || []).map((img) => {
    const parts = img.local_path.split('/');
    const fileName = parts[parts.length - 1];
    const pid = parts[parts.length - 2];
    return { src: `/images/${pid}/${fileName}`, is_main: img.is_main, position: img.position };
  });

  const rawPrice = Number(p.price) || 0;
  const rawFinal = Number(p.final_price) || rawPrice;

  let price = rawPrice;
  let final_price = rawFinal;
  if (PRICE_MULTIPLY) {
    const m = priceMultiplier(p.id);
    price = Math.round(rawPrice * m);
    final_price = Math.round(rawFinal * m);
  }
  const discount = price > final_price && price > 0
    ? Math.round(((price - final_price) / price) * 100)
    : 0;

  return {
    id: p.id,
    name: p.name,
    description: cleanText(p.description),
    specs: parseSpecs(p.specs),
    application: cleanText(p.application),
    composition: cleanText(p.composition),
    disclaimer: cleanText(p.disclaimer),
    price,
    final_price,
    discount,
    url: p.url,
    product_code: p.product_code || null,
    brand,
    manufacturer,
    category_ids: catIds,
    images,
  };
});

// Категория -> [product ids] (только категории назначения, не бренды)
const catToProducts = new Map();
for (const p of products) {
  for (const cid of p.category_ids) {
    if (brandCats.has(cid)) continue;
    if (!catToProducts.has(cid)) catToProducts.set(cid, []);
    catToProducts.get(cid).push(p.id);
  }
}
const catProducts = Object.fromEntries([...catToProducts.entries()]);

// ---------------------------------------------------------------------------
// Запись JSON
// ---------------------------------------------------------------------------
mkdirSync(DATA_OUT, { recursive: true });
writeFileSync(join(DATA_OUT, 'tabs.json'), JSON.stringify(TABS, null, 2));
writeFileSync(join(DATA_OUT, 'categories.json'), JSON.stringify(categories, null, 2));
writeFileSync(join(DATA_OUT, 'products.json'), JSON.stringify(products, null, 2));
writeFileSync(join(DATA_OUT, 'category-products.json'), JSON.stringify(catProducts, null, 2));

console.log('Готово:');
console.log(`  товаров: ${products.length}`);
console.log(`  категорий: ${categories.length}`);
console.log(`  картинок: ${copied}`);



import { readFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Типы
// ---------------------------------------------------------------------------
export interface Spec {
  key: string;
  value: string;
}

export interface ProductImage {
  src: string;
  is_main: boolean;
  position: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  specs: Spec[];
  application: string;
  composition: string;
  disclaimer: string;
  price: number;
  final_price: number;
  discount: number;
  url: string;
  product_code: string | null;
  brand: string | null;
  manufacturer: string | null;
  category_ids: number[];
  images: ProductImage[];
}

// Облегчённое представление товара для клиентских страниц
// (корзина, избранное, сравнение) — без больших текстовых полей.
export interface ProductLight {
  id: number;
  name: string;
  specs: Spec[];
  price: number;
  final_price: number;
  discount: number;
  brand: string | null;
  manufacturer: string | null;
  images: ProductImage[];
}

export function toLight(p: Product): ProductLight {
  return {
    id: p.id,
    name: p.name,
    specs: p.specs,
    price: p.price,
    final_price: p.final_price,
    discount: p.discount,
    brand: p.brand,
    manufacturer: p.manufacturer,
    images: p.images,
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  root_id: number;
  products_count: number;
}

export interface Tab {
  id: number;
  name: string;
  slug: string;
}

// ---------------------------------------------------------------------------
// Загрузка данных из файлов (используется только в серверных компонентах)
// ---------------------------------------------------------------------------
const DATA_DIR = join(process.cwd(), "data");

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")) as T;
}

export function getProducts(): Product[] {
  return loadJson<Product[]>("products.json");
}

// Лёгкие продукты для клиентских страниц (корзина/избранное/сравнение)
export function getProductsLight(): ProductLight[] {
  return getProducts().map(toLight);
}

export function getProduct(id: number | string): Product | undefined {
  const pid = Number(id);
  return getProducts().find((p) => p.id === pid);
}

export function getCategories(): Category[] {
  return loadJson<Category[]>("categories.json");
}

export function getTabs(): Tab[] {
  return loadJson<Tab[]>("tabs.json");
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getCategoryById(id: number | string): Category | undefined {
  const cid = Number(id);
  return getCategories().find((c) => c.id === cid);
}

export function getProductsByCategory(catId: number | string): Product[] {
  const map = loadJson<Record<string, number[]>>("category-products.json");
  const ids = map[String(catId)] || [];
  const byId = new Map(getProducts().map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as Product[];
}

export function getCategoryCount(catId: number | string): number {
  const map = loadJson<Record<string, number[]>>("category-products.json");
  return (map[String(catId)] || []).length;
}

// Товары категории вместе с товарами всех дочерних категорий (для корневых групп).
export function getCategoryProductsTree(catId: number, depth = 0): Product[] {
  const byId = new Map(getProducts().map((p) => [p.id, p]));
  const map = loadJson<Record<string, number[]>>("category-products.json");
  const seen = new Set<number>();
  const result: Product[] = [];

  const collect = (id: number) => {
    const ids = map[String(id)] || [];
    for (const pid of ids) {
      if (seen.has(pid)) continue;
      seen.add(pid);
      const prod = byId.get(pid);
      if (prod) result.push(prod);
    }
    if (depth > 0) {
      for (const child of getCategories().filter((c) => c.parent_id === id)) {
        collect(child.id);
      }
    }
  };
  collect(catId);
  return result;
}

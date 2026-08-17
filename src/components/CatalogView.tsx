"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "./ProductCard";
import { productCountLabel } from "@/lib/format";
import type { Product } from "@/lib/data";

type SortKey = "popular" | "price-asc" | "price-desc" | "name" | "discount";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Сначала популярные" },
  { key: "discount", label: "Со скидкой" },
  { key: "price-asc", label: "Дешевле" },
  { key: "price-desc", label: "Дороже" },
  { key: "name", label: "По названию" },
];

export default function CatalogView({
  products,
  availableBrands,
}: {
  products: Product[];
  availableBrands: string[];
}) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("popular");
  const [page, setPage] = useState(0);
  const perPage = 12;

  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.final_price), 0)),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products;
    if (selectedBrands.length > 0) {
      list = list.filter((p) => p.brand && selectedBrands.includes(p.brand));
    }
    if (maxPrice != null) {
      list = list.filter((p) => p.final_price <= maxPrice);
    }
    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.final_price - b.final_price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.final_price - a.final_price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      case "discount":
        sorted.sort((a, b) => b.discount - a.discount);
        break;
      default:
        sorted.sort((a, b) => b.id - a.id);
    }
    return sorted;
  }, [products, selectedBrands, maxPrice, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * perPage, current * perPage + perPage);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(0);
  };

  const hasFilters = selectedBrands.length > 0 || maxPrice != null;

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Фильтры */}
      <aside className="lg:sticky lg:top-[168px] lg:self-start">
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-text-primary">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Фильтры
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBrands([]);
                  setMaxPrice(null);
                  setPage(0);
                }}
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
              >
                <X className="size-3.5" aria-hidden="true" /> Сбросить
              </button>
            )}
          </div>

          {/* Бренды */}
          {availableBrands.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-sm font-semibold text-text-secondary">Бренды</h3>
              <div className="max-h-64 space-y-1.5 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label
                    key={brand}
                    className="flex cursor-pointer items-center gap-2.5 text-sm text-text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                      className="h-4 w-4 accent-brand"
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Цена */}
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-text-secondary">
            Максимальная цена
          </h3>
          <input
            type="range"
            min={0}
            max={priceCeiling || 1}
            value={maxPrice ?? priceCeiling}
            onChange={(e) => {
              setMaxPrice(Number(e.target.value));
              setPage(0);
            }}
            className="w-full accent-brand"
            aria-label="Максимальная цена"
          />
          <div className="mt-1 flex justify-between text-xs text-icon-inactive">
            <span>0 сом</span>
            <span className="font-semibold text-brand">
              {(maxPrice ?? priceCeiling).toLocaleString("ru-RU")} сом
            </span>
          </div>
        </div>
      </aside>

      {/* Список */}
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-secondary">{productCountLabel(filtered.length)}</p>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Сортировка:
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                setPage(0);
              }}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-medium text-text-primary outline-none focus:border-brand"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-20 text-center text-text-secondary">
            По выбранным фильтрам товаров не найдено
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="mt-8 flex justify-center gap-1.5">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                aria-current={i === current}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  i === current
                    ? "bg-brand text-white"
                    : "text-text-secondary hover:bg-muted"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


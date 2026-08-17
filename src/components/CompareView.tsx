"use client";

import Link from "next/link";
import Image from "next/image";
import { Scale, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice, specLabel } from "@/lib/format";
import type { ProductLight } from "@/lib/data";

const SPEC_FIELDS = ["product_type", "purpose", "main_component", "country"];

export default function CompareView({ products }: { products: ProductLight[] }) {
  const { compare, toggleCompare, clearCompare } = useStore();
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = compare
    .map((id) => byId.get(id))
    .filter(Boolean) as ProductLight[];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <Scale className="mx-auto size-14 text-icon-inactive" aria-hidden="true" />
        <h2 className="mt-6 text-2xl font-bold text-text-primary">Сравнение пусто</h2>
        <p className="mt-2 text-text-secondary">
          Добавьте до 4 товаров, чтобы сравнить их характеристики.
        </p>
        <Link
          href="/catalog/categories"
          className="mt-6 inline-block rounded-full bg-btn-fill px-8 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Сравниваем {items.length} из 4 товаров
        </p>
        <button
          type="button"
          onClick={clearCompare}
          className="text-sm font-semibold text-accent hover:underline"
        >
          Очистить список
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 p-3 text-left align-bottom text-text-secondary">Товар</th>
              {items.map((p) => (
                <th key={p.id} className="min-w-[220px] p-3 align-top">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleCompare(p.id)}
                      className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-icon-inactive hover:bg-muted hover:text-accent"
                      aria-label="Убрать из сравнения"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                    <Link href={`/product/${p.id}`} className="block">
                      <div className="relative mx-auto aspect-square w-32 overflow-hidden rounded-xl bg-muted">
                        {p.images[0] && (
                          <Image
                            src={p.images[0].src}
                            alt={p.name}
                            fill
                            sizes="128px"
                            className="object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <span className="mt-2 line-clamp-2 block font-semibold text-text-primary hover:text-brand">
                        {p.name}
                      </span>
                    </Link>
                    <div className="mt-2 font-bold text-text-primary">
                      {formatPrice(p.final_price)} сом
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_FIELDS.map((field) => (
              <tr key={field} className="border-t border-border">
                <th className="bg-bg-soft p-3 text-left font-semibold text-text-secondary">
                  {specLabel(field)}
                </th>
                {items.map((p) => {
                  const spec = p.specs.find((s) => s.key === field);
                  return (
                    <td key={p.id} className="p-3 align-top text-text-primary">
                      {spec ? spec.value : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store";
import ProductCard from "./ProductCard";
import type { ProductLight } from "@/lib/data";

export default function FavoritesView({ products }: { products: ProductLight[] }) {
  const { favorites } = useStore();
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = favorites
    .map((id) => byId.get(id))
    .filter(Boolean) as ProductLight[];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <Heart className="mx-auto size-14 text-icon-inactive" aria-hidden="true" />
        <h2 className="mt-6 text-2xl font-bold text-text-primary">Избранное пусто</h2>
        <p className="mt-2 text-text-secondary">
          Отмечайте товары сердечком, чтобы они появлялись здесь.
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
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

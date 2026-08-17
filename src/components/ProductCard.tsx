"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Scale } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import type { ProductLight } from "@/lib/data";

export default function ProductCard({ product }: { product: ProductLight }) {
  const { addToCart, isFavorite, toggleFavorite, isCompare, toggleCompare } =
    useStore();
  const fav = isFavorite(product.id);
  const cmp = isCompare(product.id);
  const img = product.images[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-muted">
        {img ? (
          <Image
            src={img.src}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 280px, 296px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-icon-inactive">
            Нет фото
          </div>
        )}

        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">
            -{product.discount}%
          </span>
        )}

        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={fav ? "Убрать из избранного" : "В избранное"}
          className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white ${
            fav ? "text-accent" : "text-icon-inactive"
          }`}
        >
          <Heart className={`size-5 ${fav ? "fill-current" : ""}`} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => toggleCompare(product.id)}
          aria-label="Добавить к сравнению"
          className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white ${
            cmp ? "text-brand" : "text-icon-inactive"
          }`}
        >
          <Scale className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        {product.manufacturer && (
          <span className="mb-1 text-xs font-medium uppercase tracking-wide text-icon-inactive">
            {product.manufacturer}
          </span>
        )}
        <Link
          href={`/product/${product.id}`}
          className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-snug text-text-primary transition-colors hover:text-brand"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="leading-tight">
            {product.discount > 0 && (
              <span className="block text-xs text-icon-inactive line-through">
                {formatPrice(product.price)} сом
              </span>
            )}
            <span className="text-lg font-bold text-text-primary">
              {formatPrice(product.final_price)} сом
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => addToCart(product.id)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-btn-fill py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark active:scale-[0.98]"
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          В корзину
        </button>
      </div>
    </article>
  );
}

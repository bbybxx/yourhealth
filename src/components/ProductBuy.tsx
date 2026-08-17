"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Scale, Minus, Plus, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/data";

export default function ProductBuy({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, isFavorite, toggleFavorite, isCompare, toggleCompare } =
    useStore();
  const fav = isFavorite(product.id);
  const cmp = isCompare(product.id);

  const handleAdd = () => {
    addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      {/* Цена */}
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-text-primary">
          {formatPrice(product.final_price)} сом
        </span>
        {product.discount > 0 && (
          <div className="flex flex-col">
            <span className="text-base text-icon-inactive line-through">
              {formatPrice(product.price)} сом
            </span>
            <span className="text-sm font-bold text-accent">
              выгода {product.discount}%
            </span>
          </div>
        )}
      </div>

      {/* Кол-во и покупка */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-l-full text-text-secondary hover:bg-muted"
            aria-label="Уменьшить количество"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span className="w-10 text-center font-bold text-text-primary">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-r-full text-text-secondary hover:bg-muted"
            aria-label="Увеличить количество"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-white transition-colors active:scale-[0.99] ${
            added ? "bg-leaf text-brand-dark" : "bg-btn-fill hover:bg-brand-dark"
          }`}
        >
          {added ? (
            <>
              <Check className="size-5" aria-hidden="true" /> В корзине
            </>
          ) : (
            <>
              <ShoppingCart className="size-5" aria-hidden="true" /> В корзину
            </>
          )}
        </button>
      </div>

      {/* Действия */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold transition-colors ${
            fav ? "border-accent text-accent" : "text-text-secondary hover:bg-muted"
          }`}
        >
          <Heart className={`size-4 ${fav ? "fill-current" : ""}`} aria-hidden="true" />
          {fav ? "В избранном" : "В избранное"}
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product.id)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-semibold transition-colors ${
            cmp ? "border-brand text-brand" : "text-text-secondary hover:bg-muted"
          }`}
        >
          <Scale className="size-4" aria-hidden="true" />
          {cmp ? "В сравнении" : "Сравнить"}
        </button>
      </div>

      {/* Артикул */}
      {product.product_code && (
        <p className="mt-5 text-sm text-icon-inactive">
          Артикул: <span className="font-mono text-text-secondary">{product.product_code}</span>
        </p>
      )}
    </div>
  );
}

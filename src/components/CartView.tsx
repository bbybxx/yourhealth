"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import type { ProductLight } from "@/lib/data";

export default function CartView({ products }: { products: ProductLight[] }) {
  const { cart, setCartQty, removeFromCart, clearCart } = useStore();
  const [ordered, setOrdered] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const items = cart
    .map((ci) => {
      const product = byId.get(ci.id);
      return product ? { product, qty: ci.qty } : null;
    })
    .filter(Boolean) as { product: ProductLight; qty: number }[];

  const total = items.reduce((s, i) => s + i.product.final_price * i.qty, 0);
  const oldTotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const saving = Math.max(0, oldTotal - total);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <ShoppingCart className="mx-auto size-14 text-icon-inactive" aria-hidden="true" />
        <h2 className="mt-6 text-2xl font-bold text-text-primary">Корзина пуста</h2>
        <p className="mt-2 text-text-secondary">Добавьте товары в корзину, чтобы оформить заказ.</p>
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
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {/* Позиции */}
      <div className="space-y-3">
        {items.map(({ product, qty }) => (
          <div key={product.id} className="flex gap-4 rounded-2xl border border-border bg-white p-4">
            <Link
              href={`/product/${product.id}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted"
            >
              {product.images[0] && (
                <Image
                  src={product.images[0].src}
                  alt={product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                  loading="lazy"
                />
              )}
            </Link>
            <div className="flex flex-1 flex-col">
              <Link
                href={`/product/${product.id}`}
                className="line-clamp-2 font-semibold text-text-primary hover:text-brand"
              >
                {product.name}
              </Link>
              <div className="mt-auto flex items-center justify-between gap-3">
                <div className="flex items-center rounded-full border border-border">
                  <button
                    type="button"
                    onClick={() => setCartQty(product.id, qty - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-l-full text-text-secondary hover:bg-muted"
                    aria-label="Уменьшить"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center font-bold text-text-primary">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setCartQty(product.id, qty + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-r-full text-text-secondary hover:bg-muted"
                    aria-label="Увеличить"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="text-right">
                  {product.discount > 0 && (
                    <div className="text-xs text-icon-inactive line-through">
                      {formatPrice(product.price * qty)}
                    </div>
                  )}
                  <div className="font-bold text-text-primary">
                    {formatPrice(product.final_price * qty)} сом
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-icon-inactive transition-colors hover:bg-muted hover:text-accent"
                  aria-label="Удалить из корзины"
                >
                  <Trash2 className="size-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Итог */}
      <aside className="h-fit rounded-2xl border border-border bg-white p-6 lg:sticky lg:top-[168px]">
        <h2 className="text-lg font-bold text-text-primary">Ваш заказ</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Товары ({items.length})</dt>
            <dd className="font-semibold text-text-primary">{formatPrice(oldTotal)} сом</dd>
          </div>
          {saving > 0 && (
            <div className="flex justify-between">
              <dt className="text-text-secondary">Скидка</dt>
              <dd className="font-semibold text-leaf">− {formatPrice(saving)} сом</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 text-base">
            <dt className="font-bold text-text-primary">Итого</dt>
            <dd className="font-bold text-brand">{formatPrice(total)} сом</dd>
          </div>
        </dl>

        {ordered ? (
          <div className="mt-6 rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">
            Спасибо! Ваш заказ оформлен. Мы свяжемся с вами для подтверждения.
          </div>
        ) : (
          <OrderForm
            items={items.map((i) => ({
              name: i.product.name,
              qty: i.qty,
              total: i.product.final_price * i.qty,
            }))}
            total={total}
            onOrder={() => setOrdered(true)}
            clearCart={clearCart}
          />
        )}

        <button
          type="button"
          onClick={clearCart}
          className="mt-4 w-full text-center text-sm text-icon-inactive hover:text-accent"
        >
          Очистить корзину
        </button>
      </aside>
    </div>
  );
}

function OrderForm({
  items,
  total,
  onOrder,
  clearCart,
}: {
  items: { name: string; qty: number; total: number }[];
  total: number;
  onOrder: () => void;
  clearCart: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, items, total }),
      });
      if (!res.ok) {
        throw new Error("Не удалось отправить заказ");
      }
      clearCart();
      onOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="mt-6 space-y-3" onSubmit={submit}>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ваше имя"
        className="w-full rounded-xl border border-border px-4 py-3 text-sm text-text-primary outline-none focus:border-brand"
      />
      <input
        required
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+996 (___) ___-__-__"
        className="w-full rounded-xl border border-border px-4 py-3 text-sm text-text-primary outline-none focus:border-brand"
      />
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600">
          {error}. Попробуйте ещё раз.
        </p>
      )}
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-full bg-accent py-3.5 font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
      >
        {sending ? "Отправка…" : "Оформить заказ"}
      </button>
      <p className="text-xs text-icon-inactive">
        Менеджер свяжется с вами для подтверждения. Доставка по Бишкеку — до 7
        дней, в регионы — до 30 дней.
      </p>
    </form>
  );
}


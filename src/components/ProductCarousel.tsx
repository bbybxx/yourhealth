"use client";

import { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/data";

export default function ProductCarousel({
  products,
  title,
  accentWord,
}: {
  products: Product[];
  title: string;
  accentWord?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 16 : 320;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  return (
    <section className="container-max py-12" role="region" aria-roledescription="carousel" aria-label={title}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
          {title}
          {accentWord && <span className="font-serif italic text-accent"> {accentWord}</span>}
        </h2>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-icon-primary transition-colors hover:bg-muted"
            aria-label="Предыдущие товары"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-icon-primary transition-colors hover:bg-muted"
            aria-label="Следующие товары"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
      >
        {products.map((p) => (
          <div
            key={p.id}
            data-card
            className="w-[280px] shrink-0 snap-start md:w-[296px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

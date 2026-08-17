"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/data";

export default function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];
  const thumbs = images.slice(0, 5);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-muted text-icon-inactive">
        Нет фото
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-white">
        <Image
          key={current.src}
          src={current.src}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
        />
      </div>
      {thumbs.length > 1 && (
        <div className="mt-3 flex gap-3">
          {thumbs.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1}`}
              className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 bg-muted transition-colors ${
                i === active ? "border-brand" : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

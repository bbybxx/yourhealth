import Link from "next/link";
import Image from "next/image";
import { getProductsByCategory } from "@/lib/data";
import type { Category } from "@/lib/data";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((cat) => {
        const products = getProductsByCategory(cat.id);
        const img = products.find((p) => p.images[0])?.images[0];
        return (
          <Link
            key={cat.id}
            href={`/catalog/${cat.slug}`}
            className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              {img ? (
                <Image
                  src={img.src}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 296px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-icon-inactive">
                  —
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-text-primary transition-colors group-hover:text-brand">
                {cat.name}
              </h3>
              <p className="mt-1 text-sm text-icon-inactive">{cat.products_count} товаров</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProductsByCategory } from "@/lib/data";
import { ROOT_BRANDS } from "@/lib/categories";
import { productCountLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Бренды" };

export default function BrandsPage() {
  const brands = getCategories()
    .filter((c) => c.root_id === ROOT_BRANDS)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));

  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Бренды <span className="font-serif italic text-accent">магазина</span>
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Мы работаем только с проверенными мировыми брендами витаминов и
        биологически активных добавок.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => {
          const count = getProductsByCategory(brand.id).length;
          return (
            <Link
              key={brand.id}
              href={`/catalog/${brand.slug}`}
              className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h2 className="text-lg font-bold text-text-primary transition-colors group-hover:text-brand">
                {brand.name}
              </h2>
              <p className="mt-1 text-sm text-icon-inactive">
                {productCountLabel(count)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

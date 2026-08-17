import type { Metadata } from "next";
import { getProducts } from "@/lib/data";
import SearchBox from "@/components/SearchBox";
import ProductCard from "@/components/ProductCard";
import { productCountLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Поиск по каталогу",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = getProducts();
  const query = q.trim().toLowerCase();

  const results = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.brand?.toLowerCase().includes(query) ?? false) ||
          p.description.toLowerCase().includes(query)
      )
    : [];

  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Поиск <span className="font-serif italic text-accent">товаров</span>
      </h1>
      <div className="mt-6">
        <SearchBox initial={q} />
      </div>

      {query ? (
        <div className="mt-10">
          <p className="text-sm text-text-secondary">
            {results.length > 0
              ? `По запросу «${q.trim()}» найдено ${productCountLabel(results.length)}`
              : `По запросу «${q.trim()}» ничего не найдено`}
          </p>
          {results.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-10 text-text-secondary">
          Введите запрос, чтобы найти нужный товар — по названию, бренду или
          описанию.
        </p>
      )}
    </div>
  );
}

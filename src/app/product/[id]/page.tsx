import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProduct, getProducts, getCategories } from "@/lib/data";
import { ROOT_BRANDS } from "@/lib/categories";
import { specLabel } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import ProductBuy from "@/components/ProductBuy";
import ProductCarousel from "@/components/ProductCarousel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description?.slice(0, 160) || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  const related = product.brand
    ? getProducts().filter((p) => p.brand === product.brand && p.id !== product.id)
    : [];

  // Ссылка на бренд (категория вкладки «Бренды»)
  const brandCat = product.brand
    ? getCategories().find(
        (c) => c.root_id === ROOT_BRANDS && c.name === product.brand
      )
    : null;
  const brandHref = brandCat ? `/catalog/${brandCat.slug}` : null;

  return (
    <div className="container-max py-10">
      <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-sm text-icon-inactive">
        <Link href="/" className="hover:text-brand">Главная</Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link href="/catalog/categories" className="hover:text-brand">Каталог</Link>
        {product.brand && brandHref && (
          <>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link href={brandHref} className="hover:text-brand">
              {product.brand}
            </Link>
          </>
        )}
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="text-text-secondary">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          {product.manufacturer && (
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
              {product.manufacturer}
            </p>
          )}
          <h1 className="text-[28px] font-bold leading-[36px] text-text-primary md:text-[36px] md:leading-10">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-text-secondary">
              {cleanDescription(product.description)}
            </p>
          )}

          <div className="mt-6 border-t border-border pt-6">
            <ProductBuy product={product} />
          </div>
        </div>
      </div>

      {/* Характеристики */}
      {product.specs.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[24px] font-bold text-text-primary">Характеристики</h2>
          <dl className="mt-4 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {product.specs.map((s) => (
              <div key={s.key} className="flex justify-between gap-4 border-b border-border pb-2">
                <dt className="text-sm text-icon-inactive">{specLabel(s.key)}</dt>
                <dd className="text-right text-sm font-medium text-text-primary">{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Применение и состав */}
      {(product.application || product.composition) && (
        <section className="mt-14 grid gap-8 md:grid-cols-2">
          {product.application && (
            <div className="rounded-2xl bg-bg-soft p-6">
              <h2 className="text-xl font-bold text-text-primary">Применение</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-text-secondary">
                {product.application}
              </p>
            </div>
          )}
          {product.composition && (
            <div className="rounded-2xl bg-bg-soft p-6">
              <h2 className="text-xl font-bold text-text-primary">Состав</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-text-secondary">
                {product.composition}
              </p>
            </div>
          )}
        </section>
      )}

      {product.disclaimer && (
        <p className="mt-10 rounded-2xl border border-border p-5 text-sm leading-relaxed text-icon-inactive">
          {product.disclaimer}
        </p>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <ProductCarousel
            products={related.slice(0, 12)}
            title={`Ещё от ${product.brand}`}
          />
        </div>
      )}
    </div>
  );
}

// Обрезка «мусорного» префикса-фразы в начале описания
function cleanDescription(d: string): string {
  const firstNewline = d.indexOf("\n");
  if (firstNewline > 0) {
    const first = d.slice(0, firstNewline);
    if (first.length < 25) return d.slice(firstNewline + 1).trim();
  }
  return d;
}

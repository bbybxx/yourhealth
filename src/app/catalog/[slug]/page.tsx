import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  getCategoryBySlug,
  getCategories,
  getCategoryProductsTree,
} from "@/lib/data";
import { buildCategoryGroups, ROOT_CATEGORIES, ROOT_SUPPLEMENTS } from "@/lib/categories";
import CategoryGrid from "@/components/CategoryGrid";
import CatalogView from "@/components/CatalogView";
import { productCountLabel } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "categories" || slug === "supplements") {
    return {
      title:
        slug === "categories" ? "Каталог категорий" : "Пищевые добавки",
    };
  }
  const cat = getCategoryBySlug(slug);
  if (!cat) return {};
  return { title: cat.name };
}

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Обзор вкладок
  if (slug === "categories" || slug === "supplements") {
    const rootId = slug === "categories" ? ROOT_CATEGORIES : ROOT_SUPPLEMENTS;
    const groups = buildCategoryGroups(rootId);
    const title =
      slug === "categories" ? "Каталог категорий" : "Пищевые добавки";
    return (
      <div className="container-max py-10">
        <Breadcrumbs items={[{ label: "Каталог", href: "/catalog" }, { label: title }]} />
        <h1 className="mt-4 text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Выберите интересующую категорию, чтобы подобрать подходящие витамины и
          добавки.
        </p>
        <div className="mt-8">
          <CategoryGrid categories={groups} />
        </div>
      </div>
    );
  }

  // Конкретная категория
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();

  const products = getCategoryProductsTree(cat.id, 1);
  const availableBrands = Array.from(
    new Set(products.map((p) => p.brand).filter(Boolean) as string[])
  ).sort();

  // Хлебные крошки из вкладки
  const tabLabel =
    cat.root_id === ROOT_SUPPLEMENTS
      ? { label: "Пищевые добавки", href: "/catalog/supplements" }
      : cat.root_id === ROOT_CATEGORIES
        ? { label: "Каталог", href: "/catalog/categories" }
        : null;

  return (
    <div className="container-max py-10">
      <Breadcrumbs
        items={[
          ...(tabLabel ? [tabLabel] : []),
          { label: cat.name, href: `/catalog/${cat.slug}` },
        ]}
      />
      <h1 className="mt-4 text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        {cat.name}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        {productCountLabel(products.length)}
      </p>

      {/* Подкатегории */}
      <Subcategories slug={cat.slug} />

      <div className="mt-8">
        <CatalogView products={products} availableBrands={availableBrands} />
      </div>
    </div>
  );
}

function Subcategories({ slug }: { slug: string }) {
  const parent = getCategoryBySlug(slug);
  if (!parent) return null;
  const children = getCategories().filter((c) => c.parent_id === parent.id);
  if (children.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {children.map((c) => (
        <Link
          key={c.id}
          href={`/catalog/${c.slug}`}
          className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand"
        >
          {c.name} · {c.products_count}
        </Link>
      ))}
    </div>
  );
}

function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="flex items-center gap-1.5 text-sm text-icon-inactive">
      <Link href="/" className="hover:text-brand">Главная</Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="size-4" aria-hidden="true" />
          {item.href ? (
            <Link href={item.href} className="hover:text-brand">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-secondary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

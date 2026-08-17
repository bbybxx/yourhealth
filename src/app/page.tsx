import Link from "next/link";
import { Leaf, Truck, ShieldCheck, BadgePercent } from "lucide-react";
import Hero, { type HeroSlide } from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import CategoryGrid from "@/components/CategoryGrid";
import { getProducts } from "@/lib/data";
import { buildCategoryGroups, ROOT_CATEGORIES } from "@/lib/categories";

const FEATURES = [
  { icon: ShieldCheck, title: "Оригинальная продукция", text: "Работаем напрямую с проверенными поставщиками" },
  { icon: Leaf, title: "Натуральный состав", text: "Только качественные витамины и БАД" },
  { icon: Truck, title: "Быстрая доставка", text: "Доставим по Бишкеку и регионам" },
  { icon: BadgePercent, title: "Выгодные акции", text: "Скидки и бонусы для постоянных клиентов" },
];

export default function HomePage() {
  const products = getProducts();

  // Новинки: последние добавленные (по наибольшему id)
  const newest = [...products].sort((a, b) => b.id - a.id).slice(0, 12);

  const slides: HeroSlide[] = [
    {
      key: "mollers",
      kicker: "Норвежское качество",
      title: "Омега-3 от",
      accent: "Möller's",
      subtitle:
        "Чистый норвежский рыбий жир с витаминами A, D, E для здоровья сердца, мозга и глаз.",
      cta: "Смотреть Омега-3",
      href: "/catalog/omega-3-6-9",
      image: "/images/18439/0.avif",
    },
    {
      key: "enzymedica",
      kicker: "Эксперт по ферментам",
      title: "Пищеварение под контролем с",
      accent: "Enzymedica",
      subtitle:
        "Современные ферментные комплексы и пробиотики для лёгкого усвоения пищи.",
      cta: "К ферментам",
      href: "/catalog/fermenty",
      image: "/images/2433/0.avif",
    },
    {
      key: "sale",
      kicker: "Август выгодных покупок",
      title: "Скидки до",
      accent: "80%",
      subtitle:
        "Только в этом месяце — выгодные цены на популярные добавки. Успейте заказать!",
      cta: "Перейти к акциям",
      href: "/catalog/categories",
      image: "/images/9083/0.avif",
    },
  ];

  const categories = buildCategoryGroups(ROOT_CATEGORIES);

  return (
    <>
      <Hero slides={slides} />

      {/* Категории */}
      <section className="container-max py-14">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
            Популярные <span className="font-serif italic text-accent">категории</span>
          </h2>
          <Link
            href="/catalog/categories"
            className="hidden items-center gap-1 text-sm font-semibold text-brand hover:opacity-80 md:flex"
          >
            Все категории
          </Link>
        </div>
        <CategoryGrid categories={categories.slice(0, 8)} />
      </section>

      {/* Новинки */}
      <ProductCarousel products={newest} title="Новинки" accentWord="магазина" />

      {/* Преимущества */}
      <section className="bg-bg-soft py-12">
        <div className="container-max grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <f.icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold text-text-primary">{f.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}


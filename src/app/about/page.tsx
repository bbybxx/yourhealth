import type { Metadata } from "next";
import { Leaf, ShieldCheck, HeartHandshake } from "lucide-react";

export const metadata: Metadata = { title: "О компании" };

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Качество",
    text: "Гарантируем оригинальность каждой единицы товара. Поставляем напрямую от официальных дистрибьюторов.",
  },
  {
    icon: Leaf,
    title: "Забота о природе",
    text: "Подбираем продукты с натуральными и безопасными составами, уважая природу и здоровье покупателей.",
  },
  {
    icon: HeartHandshake,
    title: "Честность",
    text: "Прозрачные цены, честные скидки и квалифицированные консультации по каждому товару.",
  },
];

export default function AboutPage() {
  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        О компании <span className="font-serif italic text-accent">your health</span>
      </h1>

      <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-text-secondary">
        <p>
          «your health» — магазин витаминов и биологически активных добавок.
          Мы помогаем людям заботиться о своём здоровье, предлагая качественную
          продукцию от ведущих мировых брендов: NOW Foods, Life Extension,
          Enzymedica, Nature&apos;s Plus, Möller&apos;s и многих других.
        </p>
        <p>
          В нашем каталоге — мультивитамины, омега-3, минералы, ферменты,
          пробиотики, средства для здоровья кожи, волос и ногтей, а также
          уходовые продукты. Мы внимательно относимся к выбору ассортимента и
          работаем только с проверенными поставщиками.
        </p>
        <p>
          Мы доставляем заказы по Бишкеку и всем регионам Кыргызстана, а также
          бесплатно консультируем по подбору подходящих добавок.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-2xl border border-border bg-white p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand">
              <v.icon className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-text-primary">{v.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{v.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

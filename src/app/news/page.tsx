import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Новости и акции" };

const NEWS = [
  {
    tag: "Акция",
    title: "Август выгодных покупок: скидки до 80%",
    text: "Всю неделю действуют сниженные цены на популярные добавки. Загляните в каталог, чтобы не пропустить предложения.",
    href: "/catalog/categories",
  },
  {
    tag: "Новинка",
    title: "Норвежские Омега-3 от Möller's",
    text: "В ассортименте появился детский и взрослый рыбий жир Möller's с витаминами A, D и E — качество, проверенное временем.",
    href: "/catalog/mollers",
  },
  {
    tag: "Совет",
    title: "Как поддерживать иммунитет осенью",
    text: "Витамин C, цинк и витамин D помогут подготовиться к сезону простуд. Подробнее — в нашем центре здоровья.",
    href: "/health",
  },
];

export default function NewsPage() {
  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Новости и <span className="font-serif italic text-accent">акции</span>
      </h1>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {NEWS.map((n) => (
          <Link
            key={n.title}
            href={n.href}
            className="group flex flex-col rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
          >
            <span className="mb-3 self-start rounded-full bg-brand-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">
              {n.tag}
            </span>
            <h2 className="text-lg font-bold text-text-primary transition-colors group-hover:text-brand">
              {n.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{n.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

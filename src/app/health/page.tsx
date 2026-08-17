import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Центр здоровья" };

const ARTICLES = [
  {
    title: "Как выбрать витамин D",
    text: "Витамин D важен для иммунитета, костей и настроения. Рассказываем, как подобрать дозировку и форму.",
    href: "/catalog/vitamin-d",
  },
  {
    title: "Омега-3: зачем она нужна",
    text: "Омега-3 жирные кислоты поддерживают работу сердца, мозга и глаз. Читайте о пользе и источниках.",
    href: "/catalog/omega-3-6-9",
  },
  {
    title: "Пробиотики и здоровье кишечника",
    text: "Здоровый микробиом — основа хорошего пищеварения и иммунитета. Как выбрать пробиотик.",
    href: "/catalog/probiotiki",
  },
  {
    title: "Магний для нервной системы",
    text: "Магний помогает бороться со стрессом, улучшает сон и работу мышц. Какие формы усваиваются лучше.",
    href: "/catalog/magnii",
  },
];

export default function HealthPage() {
  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Центр <span className="font-serif italic text-accent">здоровья</span>
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">
        Полезные материалы о витаминах и добавках. Информация носит справочный
        характер и не заменяет консультацию врача.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold text-text-primary transition-colors group-hover:text-brand">
              {a.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{a.text}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-accent">
              Читать →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

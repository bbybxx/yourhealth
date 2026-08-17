import type { Metadata } from "next";

export const metadata: Metadata = { title: "Вопросы и ответы" };

const FAQS = [
  {
    q: "Являются ли добавки лекарственными средствами?",
    a: "Нет. Все представленные продукты являются биологически активными добавками к пище (БАД), а не лекарствами. Они не предназначены для диагностики, лечения или профилактики заболеваний.",
  },
  {
    q: "Как выбрать подходящий витаминный комплекс?",
    a: "Мы рекомендуем проконсультироваться со специалистом и сдать анализы на дефицит витаминов и минералов. В нашем центре здоровья вы можете получить рекомендации по подбору добавок.",
  },
  {
    q: "Оригинальная ли продукция в магазине?",
    a: "Да. Мы сотрудничаем только с официальными дистрибьюторами и гарантируем оригинальность каждой позиции каталога.",
  },
  {
    q: "Сколько времени занимает доставка?",
    a: "По Бишкеку заказ доставляется в день обращения при наличии товара. В регионы — в течение 1–3 рабочих дней.",
  },
  {
    q: "Можно ли вернуть товар?",
    a: "Не вскрытые и надлежащим образом сохранённые товары можно вернуть в течение 14 дней при наличии чека и полной комплектации.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Вопросы и <span className="font-serif italic text-accent">ответы</span>
      </h1>

      <div className="mt-8 max-w-3xl space-y-4">
        {FAQS.map((f, i) => (
          <details key={i} className="group rounded-2xl border border-border bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-text-primary">
              {f.q}
              <span className="shrink-0 text-icon-inactive transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

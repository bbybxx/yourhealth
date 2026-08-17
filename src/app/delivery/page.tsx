import type { Metadata } from "next";
import { Truck, Banknote, Clock3, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Доставка и оплата" };

const OPTIONS = [
  {
    icon: Truck,
    title: "Доставка по Бишкеку",
    text: "Доставка по Бишкеку осуществляется в течение до 7 дней. Стоимость зависит от зоны доставки.",
  },
  {
    icon: MapPin,
    title: "Доставка по Кыргызстану",
    text: "Отправка в регионы через транспортные компании и почтовые службы. Срок доставки — до 30 дней.",
  },
  {
    icon: Clock3,
    title: "Сроки",
    text: "Обрабатываем заказ в день подтверждения. По Бишкеку — до 7 дней, в регионы — до 30 дней.",
  },
  {
    icon: Banknote,
    title: "Способы оплаты",
    text: "Оплата наличными или картой при получении, а также онлайн-переводом при оформлении.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Доставка и <span className="font-serif italic text-accent">оплата</span>
      </h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {OPTIONS.map((o) => (
          <div key={o.title} className="flex gap-4 rounded-2xl border border-border bg-white p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
              <o.icon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-text-primary">{o.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{o.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-text-secondary">
        <h2 className="text-xl font-bold text-text-primary">Как оформить заказ</h2>
        <ol className="list-inside list-decimal space-y-2">
          <li>Добавьте товары в корзину и оформите заказ, указав имя и телефон.</li>
          <li>Менеджер свяжется с вами для подтверждения наличия и стоимости.</li>
          <li>Получите заказ удобным для вас способом и оплатите при получении.</li>
        </ol>
      </div>
    </div>
  );
}

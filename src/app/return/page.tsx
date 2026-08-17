import type { Metadata } from "next";

export const metadata: Metadata = { title: "Возврат товара" };

export default function ReturnPage() {
  return (
    <div className="container-max py-10">
      <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
        Возврат <span className="font-serif italic text-accent">товара</span>
      </h1>

      <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-text-secondary">
        <p>
          Товар надлежащего качества можно вернуть или обменять в течение 14
          дней с момента покупки при соблюдении следующих условий:
        </p>
        <ul className="list-inside list-disc space-y-2">
          <li>товар не был в употреблении и сохранены его товарный вид и упаковка;</li>
          <li>сохранены все ярлыки, пломбы и комплектующие;</li>
          <li>имеется документ, подтверждающий покупку (чек или номер заказа).</li>
        </ul>
        <p>
          Биологически активные добавки, вскрытые или имеющие нарушенную
          целостность упаковки, возврату не подлежат в соответствии с
          действующим законодательством.
        </p>
        <p>
          Для оформления возврата свяжитесь с нами — менеджер подскажет порядок
          действий и адрес пункта приёма.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Правила обработки персональных данных" };

export default function PrivacyPage() {
  return (
    <div className="container-max py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-[30px] font-bold leading-9 text-text-primary md:text-[36px] md:leading-10">
          Правила обработки персональных данных
        </h1>
        <p className="mt-3 text-sm text-text-secondary">
          Дата вступления в силу: 23 апреля 2026 г. · Последнее обновление: 23
          апреля 2026 г.
        </p>

        <div className="mt-8 space-y-8 text-base leading-relaxed text-text-secondary">
          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              1. Общие положения
            </h2>
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Настоящие Правила обработки персональных данных (далее —
                «Правила») определяют порядок сбора, хранения, обработки и
                защиты персональных данных пользователей интернет-магазина
                «ИНТЕРМАГ» (далее — «Магазин»).
              </li>
              <li>
                Оператором персональных данных является ОсОО «ИНТЕРМАГ» (далее —
                «Оператор»).
              </li>
            </ol>
            <p className="mt-3 font-semibold text-text-primary">
              Реквизиты Оператора:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Наименование: ОсОО «ИНТЕРМАГ»</li>
              <li>Адрес: Кыргызская Республика, г. Бишкек, ул. Калык-Акиева, 72, кв 8</li>
              <li>Регистрационный номер: 302737-3301-OOO</li>
              <li>ИНН: 02404202410041</li>
              <li>ОКПО: 32781571</li>
              <li>Директор: Марухин Юрий</li>
              <li>E-mail: intermagllc@gmail.com</li>
            </ul>
            <ol className="mt-3 list-inside list-decimal space-y-2">
              <li>
                Используя Магазин, Пользователь выражает своё согласие с
                настоящими Правилами. В случае несогласия Пользователь должен
                прекратить использование Магазина.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              2. Какие данные мы собираем
            </h2>
            <p className="mb-2">Мы можем собирать следующие категории персональных данных:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Фамилия, имя, отчество</li>
              <li>Адрес электронной почты</li>
              <li>Номер телефона</li>
              <li>Адрес доставки</li>
              <li>Техническая информация (IP-адрес, тип браузера, cookies)</li>
              <li>Информация об использовании Магазина</li>
              <li>История заказов и предпочтения</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              3. Цели обработки персональных данных
            </h2>
            <p className="mb-2">Персональные данные обрабатываются для следующих целей:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Оформление и обработка заказов</li>
              <li>Доставка товаров</li>
              <li>Связь с Пользователем для уточнения деталей заказа</li>
              <li>Отправка уведомлений о статусе заказа</li>
              <li>Обработка возвратов и обменов</li>
              <li>Улучшение качества работы Магазина</li>
              <li>Исполнение обязательств по договору (оферте)</li>
              <li>Соблюдение требований законодательства</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              4. Правовые основания обработки
            </h2>
            <p className="mb-2">Обработка персональных данных осуществляется на основании:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Согласия Пользователя на обработку персональных данных</li>
              <li>
                Необходимости исполнения договора, стороной которого является
                Пользователь
              </li>
              <li>
                Требований законодательства Кыргызской Республики (Закон КР «Об
                информации персонального характера»)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              5. Хранение и защита данных
            </h2>
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Оператор принимает необходимые организационные и технические
                меры для защиты персональных данных от неправомерного или
                случайного доступа, уничтожения, изменения, блокирования,
                копирования, распространения.
              </li>
              <li>
                Персональные данные хранятся не дольше, чем этого требуют цели
                обработки, если иное не предусмотрено законодательством.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              6. Передача данных третьим лицам
            </h2>
            <p className="mb-2">
              Оператор не передаёт персональные данные третьим лицам, за
              исключением случаев:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>Явного согласия Пользователя</li>
              <li>Требований законодательства Кыргызской Республики</li>
              <li>
                Необходимости исполнения договора с использованием партнёрских
                сервисов (службы доставки, платежные системы)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              7. Права пользователя
            </h2>
            <p className="mb-2">Пользователь имеет право:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Получить информацию об обработке своих персональных данных</li>
              <li>Требовать уточнения, блокирования или уничтожения персональных данных</li>
              <li>Отозвать согласие на обработку персональных данных</li>
              <li>
                Обжаловать действия Оператора в уполномоченный орган
                (Государственное агентство по защите персональных данных при
                Кабинете Министров КР)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              8. Cookies и аналитика
            </h2>
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Магазин может использовать файлы cookies для обеспечения
                корректной работы, персонализации контента и сбора аналитических
                данных.
              </li>
              <li>
                Пользователь может отключить cookies в настройках браузера, однако
                это может повлиять на функциональность Магазина.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              9. Изменение Правил
            </h2>
            <ol className="list-inside list-decimal space-y-2">
              <li>
                Оператор оставляет за собой право вносить изменения в настоящие
                Правила. Актуальная версия размещается на данной странице.
              </li>
              <li>
                Продолжение использования Магазина после изменения Правил
                означает согласие Пользователя с такими изменениями.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-text-primary">
              10. Контактная информация
            </h2>
            <p className="mb-2">
              По вопросам обработки персональных данных обращайтесь:
            </p>
            <ul className="list-inside list-disc space-y-1">
              <li>E-mail: intermagllc@gmail.com</li>
              <li>Юридический адрес: Кыргызская Республика, г. Бишкек, ул. Калык-Акиева, 72, кв 8</li>
            </ul>
          </section>

          <p className="border-t border-border pt-6 text-sm text-icon-inactive">
            © 2021-2026 ОсОО «ИНТЕРМАГ». Все права защищены.
          </p>
        </div>
      </div>
    </div>
  );
}

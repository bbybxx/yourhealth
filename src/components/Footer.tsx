import Link from "next/link";
import Logo from "./Logo";
import type { NavSection } from "@/lib/nav";

const INFO_LINKS = [
  { label: "О компании", href: "/about" },
  { label: "Центр здоровья", href: "/health" },
  { label: "Новости и акции", href: "/news" },
  { label: "Доставка и оплата", href: "/delivery" },
  { label: "FAQ", href: "/faq" },
  { label: "Возврат товара", href: "/return" },
  { label: "Публичная оферта", href: "/offer" },
  { label: "Правила обработки персональных данных", href: "/privacy" },
];

export default function Footer({ nav }: { nav: NavSection[] }) {
  return (
    <footer className="mt-auto border-t border-border bg-brand text-white">
      <div className="container-max grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        {/* Бренд */}
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            Магазин витаминов и пищевых добавок. Заботимся о вашем здоровье с
            любовью к природе.
          </p>
        </div>

        {/* Категории */}
        {nav.slice(0, 2).map((section) => (
          <div key={section.key}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-leaf">
              {section.label}
            </h3>
            <ul className="space-y-2.5">
              {section.items.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/catalog/${item.slug}`}
                    className="text-sm text-white/75 transition-colors hover:text-white"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Информация */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-leaf">
            Информация
          </h3>
          <ul className="space-y-2.5">
            {INFO_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-max flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} your health</span>
          <span>Бишкек, Кыргызстан</span>
          <span>Не является лекарственным средством</span>
        </div>
      </div>
    </footer>
  );
}

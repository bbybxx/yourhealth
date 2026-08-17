"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, ChevronRight, MapPin, Globe, ChevronDown } from "lucide-react";
import type { NavSection } from "@/lib/nav";

export default function MobileMenu({
  nav,
  open,
  onClose,
}: {
  nav: NavSection[];
  open: boolean;
  onClose: () => void;
}) {

  // Блокировка прокрутки страницы под открытым меню
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Затемнение фона */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* Панель */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню"
        className={`fixed inset-y-0 left-0 z-[70] flex w-[85%] max-w-[360px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-serif text-lg font-bold text-brand">your health</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-icon-primary hover:bg-muted"
            aria-label="Закрыть меню"
          >
            <X className="size-6" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-border px-5 py-3 text-sm font-medium text-text-secondary">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-accent" aria-hidden="true" />
            Бишкек
          </span>
          <span className="h-4 w-px bg-border" />
          <span className="flex items-center gap-1.5">
            <Globe className="size-4 text-icon-inactive" aria-hidden="true" />
            RU
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Мобильная навигация">
          {nav.map((section) => (
            <AccordionSection key={section.key} section={section} onNavigate={onClose} />
          ))}

          <div className="mt-1 border-t border-border pt-2">
            <MenuLink href="/search" onNavigate={onClose}>Поиск</MenuLink>
            <MenuLink href="/about" onNavigate={onClose}>О нас</MenuLink>
            <MenuLink href="/health" onNavigate={onClose}>Центр здоровья</MenuLink>
            <MenuLink href="/news" onNavigate={onClose}>Новости и акции</MenuLink>
            <MenuLink href="/delivery" onNavigate={onClose}>Доставка</MenuLink>
            <MenuLink href="/faq" onNavigate={onClose}>FAQ</MenuLink>
            <MenuLink href="/compare" onNavigate={onClose}>Сравнение товаров</MenuLink>
          </div>
        </nav>

        <div className="border-t border-border p-4">
          <Link
            href="/cart"
            onClick={onClose}
            className="block w-full rounded-full bg-btn-fill py-3 text-center font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Перейти в корзину
          </Link>
        </div>
      </aside>
    </>
  );
}

function MenuLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-text-primary transition-colors hover:bg-muted"
    >
      {children}
      <ChevronRight className="size-5 text-icon-inactive" aria-hidden="true" />
    </Link>
  );
}

function AccordionSection({
  section,
  onNavigate,
}: {
  section: NavSection;
  onNavigate: () => void;
}) {
  return (
    <details className="group border-b border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-text-primary">
        <Link href={section.href} onClick={onNavigate} className="flex-1">
          {section.label}
        </Link>
        <ChevronDown
          className="size-5 text-icon-inactive transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="pb-2 pl-3">
        {section.items.map((item) => (
          <div key={item.id}>
            <Link
              href={`/catalog/${item.slug}`}
              onClick={onNavigate}
              className="block rounded-xl px-3 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-muted"
            >
              {item.name}
            </Link>
            {item.children.map((child) => (
              <Link
                key={child.id}
                href={`/catalog/${child.slug}`}
                onClick={onNavigate}
                className="block rounded-xl px-5 py-1.5 text-sm text-icon-inactive transition-colors hover:bg-muted"
              >
                {child.name}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}

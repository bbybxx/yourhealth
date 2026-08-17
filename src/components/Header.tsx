"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Heart,
  ShoppingCart,
  MapPin,
  ChevronDown,
} from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import { useStore } from "@/lib/store";
import type { NavSection } from "@/lib/nav";

const STATIC_LINKS = [
  { label: "О нас", href: "/about" },
  { label: "Центр здоровья", href: "/health" },
  { label: "Новости и акции", href: "/news" },
];

export default function Header({ nav }: { nav: NavSection[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, favorites } = useStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={`transition-colors duration-300 ${
            scrolled ? "bg-white/95 shadow-sm backdrop-blur" : "bg-transparent"
          }`}
        >
          {/* Верхняя строка */}
          <div className="container-max flex h-[64px] items-center justify-between gap-3 lg:h-[var(--header-height)]">
            {/* Слева */}
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-icon-primary transition-colors hover:bg-muted lg:hidden"
                aria-label="Открыть меню"
              >
                <Menu className="size-[26px]" aria-hidden="true" />
              </button>
              <span className="hidden items-center gap-1.5 text-sm font-medium text-text-secondary md:flex">
                <MapPin className="size-[18px] text-accent" aria-hidden="true" />
                Бишкек
              </span>
            </div>

            {/* Центр — логотип */}
            <Logo className="mx-auto" />

            {/* Справа */}
            <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1">
              <Link
                href="/favorites"
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-icon-primary transition-colors hover:bg-muted"
                aria-label="Избранное"
              >
                <Heart className="size-[26px]" aria-hidden="true" />
                {favorites.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link
                href="/search"
                className="hidden h-11 w-11 items-center justify-center rounded-full text-icon-primary transition-colors hover:bg-muted sm:flex"
                aria-label="Поиск"
              >
                <Search className="size-[26px]" aria-hidden="true" />
              </Link>
              <Link
                href="/cart"
                className="relative flex h-11 w-11 items-center justify-center rounded-full text-icon-primary transition-colors hover:bg-muted"
                aria-label="Корзина"
              >
                <ShoppingCart className="size-[26px]" aria-hidden="true" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Десктопная навигация */}
          <nav
            className="hidden border-t border-border lg:block"
            aria-label="Основная навигация"
          >
            <div className="container-max flex h-14 items-center justify-center gap-1">
              {nav.map((section) => (
                <DropdownItem key={section.key} section={section} />
              ))}
              {STATIC_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="px-4 py-2 text-base font-medium text-text-secondary transition-opacity hover:text-icon-primary hover:opacity-80"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <MobileMenu nav={nav} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function DropdownItem({ section }: { section: NavSection }) {
  return (
    <div className="group relative">
      <Link
        href={section.href}
        className="flex items-center gap-1.5 px-4 py-2 text-base font-medium text-text-secondary transition-colors hover:text-icon-primary"
      >
        {section.label}
        <ChevronDown
          className="size-4 text-icon-inactive transition-colors group-hover:text-icon-primary"
          aria-hidden="true"
        />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 min-w-[240px] translate-y-2 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="max-h-[70vh] overflow-auto rounded-2xl border border-border bg-white p-3 shadow-xl">
          {section.items.map((item) => (
            <div key={item.id} className="mb-0.5">
              <Link
                href={`/catalog/${item.slug}`}
                className="block rounded-xl px-3 py-2 text-[15px] font-medium text-text-primary transition-colors hover:bg-muted"
              >
                {item.name}
                {item.count > 0 && (
                  <span className="ml-2 text-xs font-normal text-icon-inactive">
                    {item.count}
                  </span>
                )}
              </Link>
              {item.children.length > 0 && (
                <div className="ml-3 border-l border-border pl-1.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/catalog/${child.slug}`}
                      className="block rounded-xl px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-muted"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

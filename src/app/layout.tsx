import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildNav } from "@/lib/nav";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://your-health.kg"),
  title: {
    default: "your health — магазин витаминов и пищевых добавок",
    template: "%s — your health",
  },
  description:
    "Магазин витаминов и пищевых добавок. Мультивитамины, омега-3, минералы, ферменты и уходовые средства. Оригинальная продукция с доставкой по Кыргызстану.",
  keywords: [
    "витамины",
    "БАД",
    "пищевые добавки",
    "омега-3",
    "мультивитамины",
    "Кыргызстан",
    "Бишкек",
  ],
  openGraph: {
    title: "your health — магазин витаминов",
    description:
      "Магазин витаминов и пищевых добавок с доставкой по Кыргызстану.",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "your health — магазин витаминов",
    description:
      "Магазин витаминов и пищевых добавок с доставкой по Кыргызстану.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nav = buildNav();
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-text-base">
        <StoreProvider>
          <Header nav={nav} />
          <main className="flex flex-1 flex-col pt-[64px] lg:pt-[152px]">
            {children}
          </main>
          <Footer nav={nav} />
        </StoreProvider>
      </body>
    </html>
  );
}


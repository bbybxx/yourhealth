"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export interface HeroSlide {
  key: string;
  kicker: string;
  title: string;
  accent: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
}

export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    const t = setInterval(() => go(index + 1), 6500);
    return () => clearInterval(t);
  }, [index, go]);

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Акции и бренды"
      className="relative -mt-[64px] h-[70dvh] min-h-[420px] w-full overflow-hidden lg:-mt-[152px]"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.key}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <picture>
            <source srcSet={slide.image} type="image/avif" />
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </picture>
          {/* Затемнение для читаемости */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand/85 via-brand/55 to-brand/20" />

          <div className="container-max relative flex h-full items-center">
            <div
              className={`max-w-xl transition-all duration-700 ${
                i === index ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-leaf backdrop-blur">
                {slide.kicker}
              </p>
              <h1 className="text-[32px] font-bold leading-[40px] text-white md:text-[48px] md:leading-[52px]">
                {slide.title}{" "}
                <span className="font-serif italic text-accent">{slide.accent}</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-white/85 md:text-lg">
                {slide.subtitle}
              </p>
              <Link
                href={slide.href}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-semibold text-white transition-all hover:bg-accent-dark active:scale-[0.98]"
              >
                {slide.cta}
                <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Индикаторы */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 lg:left-8 lg:translate-x-0">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Слайд ${i + 1}`}
            className={`h-[6px] rounded-full bg-white transition-all duration-300 ${
              i === index ? "w-[30px]" : "w-[6px] bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

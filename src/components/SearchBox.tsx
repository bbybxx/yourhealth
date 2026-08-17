"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBox({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <form onSubmit={submit} role="search" className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 focus-within:border-brand">
      <Search className="size-5 text-icon-inactive" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Поиск витаминов, добавок, брендов…"
        className="w-full bg-transparent py-2 text-base text-text-primary outline-none placeholder:text-icon-inactive"
        aria-label="Поиск по каталогу"
      />
      <button
        type="submit"
        className="rounded-full bg-btn-fill px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Найти
      </button>
    </form>
  );
}

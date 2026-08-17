// Форматирование цен в сомах
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

// Русская плюрализация
export function plural(n: number, forms: [string, string, string]): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return forms[2];
  if (last > 1 && last < 5) return forms[1];
  if (last === 1) return forms[0];
  return forms[2];
}

export function productCountLabel(n: number): string {
  return `${n} ${plural(n, ["товар", "товара", "товаров"])}`;
}

// Ключ характеристик — человекочитаемое имя
const SPEC_LABELS: Record<string, string> = {
  product_type: "Тип продукта",
  purpose: "Назначение",
  main_component: "Основной компонент",
  country: "Страна",
  volume: "Объём",
  weight: "Вес",
};

export function specLabel(key: string): string {
  return SPEC_LABELS[key] ?? key;
}

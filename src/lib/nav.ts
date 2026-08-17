import { getCategories, getTabs } from "./data";

export interface NavNode {
  id: number;
  name: string;
  slug: string;
  count: number;
  children: NavNode[];
}

export interface NavSection {
  key: string;
  label: string;
  href: string;
  items: NavNode[];
}

// Строит дерево вкладки (Категории / Пищевые добавки / Бренды).
// Серверная функция, результат сериализуем (пропсы в клиентские компоненты).
export function buildNav(): NavSection[] {
  const tabs = getTabs();
  const cats = getCategories();

  function treeFor(rootId: number): NavNode[] {
    const all = cats.filter((c) => c.root_id === rootId);
    const existing = new Set(all.map((c) => c.id));
    const childrenMap = new Map<number, NavNode[]>();
    const roots: NavNode[] = [];

    for (const c of all) {
      const node: NavNode = {
        id: c.id,
        name: c.name,
        slug: c.slug || String(c.id),
        count: c.products_count || 0,
        children: [],
      };
      if (c.parent_id == null || !existing.has(c.parent_id)) {
        roots.push(node);
      } else {
        if (!childrenMap.has(c.parent_id)) childrenMap.set(c.parent_id, []);
        childrenMap.get(c.parent_id)!.push(node);
      }
    }
    for (const root of roots) {
      root.children = childrenMap.get(root.id) || [];
    }
    return roots;
  }

  const hrefFor: Record<number, string> = {
    1_000_000_001: "/catalog/categories",
    1_000_000_002: "/catalog/supplements",
    1_000_000_003: "/brands",
  };

  const sections: NavSection[] = [];
  for (const t of tabs) {
    if (t.id === 1_000_000_004) continue; // сводная вкладка — не в меню
    sections.push({
      key: t.slug,
      label: t.name,
      href: hrefFor[t.id] ?? "/catalog",
      items: treeFor(t.id),
    });
  }
  return sections;
}

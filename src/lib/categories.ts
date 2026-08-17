import { getCategories, getTabs, getCategoryById, type Category, type Tab } from "./data";

// Корневые id вкладок (совпадают со скрапером)
export const ROOT_CATEGORIES = 1_000_000_001;
export const ROOT_SUPPLEMENTS = 1_000_000_002;
export const ROOT_BRANDS = 1_000_000_003;
export const ROOT_FOOD_ADDITIVES = 1_000_000_004;

// Возвращает дерево «Категории» (root_id = Категории): корни -> вложенные.
// Учитывает, что у части узлов parent_id указывает на отсутствующий узел —
// такие узлы помещаем как корневые группы верхнего уровня.
export function buildCategoryGroups(rootId: number): Category[] {
  const all = getCategories().filter((c) => c.root_id === rootId);
  const existing = new Set(all.map((c) => c.id));
  const orphans: Category[] = [];
  const children = new Map<number, Category[]>();

  for (const c of all) {
    if (c.parent_id == null || !existing.has(c.parent_id)) {
      orphans.push(c);
    } else {
      if (!children.has(c.parent_id)) children.set(c.parent_id, []);
      children.get(c.parent_id)!.push(c);
    }
  }

  // Возвращаем «плоское» упорядоченное дерево: топ-уровень (включая сирот) + их дети.
  const result: Category[] = [];
  for (const root of orphans) {
    result.push(root);
    for (const child of children.get(root.id) || []) {
      result.push(child);
    }
  }
  return result;
}

export function getNavTab(slug: string): Tab | undefined {
  return getTabs().find((t) => t.slug === slug);
}

export function getTabCategories(slug: string): Category[] {
  const tab = getNavTab(slug);
  if (!tab) return [];
  return getCategories().filter((c) => c.root_id === tab.id);
}

export function categoryBreadcrumbs(catId: number): Category[] {
  const chain: Category[] = [];
  let current = getCategoryById(catId);
  let guard = 0;
  while (current && guard < 10) {
    chain.unshift(current);
    if (current.parent_id == null) break;
    const parent = getCategoryById(current.parent_id);
    if (!parent) break;
    current = parent;
    guard++;
  }
  return chain;
}

// Название вкладки по категории
export function tabLabel(rootId: number): string {
  return getTabs().find((t) => t.id === rootId)?.name ?? "";
}

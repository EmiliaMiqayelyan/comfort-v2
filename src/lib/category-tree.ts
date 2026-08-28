import type { ProductCategory } from "@/types";

export function parentCategories(categories: ProductCategory[]) {
  return categories.filter((category) => !category.parentId);
}

export function childCategories(categories: ProductCategory[], parentId: string) {
  return categories.filter((category) => category.parentId === parentId);
}

export function descendantCategoryIds(
  categoryId: string,
  categories: ProductCategory[],
): string[] {
  const ids: string[] = [];
  const walk = (parentId: string) => {
    for (const child of childCategories(categories, parentId)) {
      ids.push(child.id);
      walk(child.id);
    }
  };
  walk(categoryId);
  return ids;
}

export function isDescendantOf(
  categoryId: string,
  ancestorId: string,
  categories: ProductCategory[],
): boolean {
  let current = categories.find((category) => category.id === categoryId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = categories.find((category) => category.id === current!.parentId);
  }
  return false;
}

export function categoryPath(
  categoryId: string,
  categories: ProductCategory[],
  localeName: (category: ProductCategory) => string,
): string {
  const parts: string[] = [];
  let current = categories.find((category) => category.id === categoryId);
  while (current) {
    parts.unshift(localeName(current));
    current = current.parentId
      ? categories.find((category) => category.id === current!.parentId)
      : undefined;
  }
  return parts.join(" → ");
}

export function categorySelectOptions(
  categories: ProductCategory[],
  localeName: (category: ProductCategory) => string,
  opts?: { excludeId?: string; excludeIds?: string[] },
) {
  const exclude = new Set([
    ...(opts?.excludeIds ?? []),
    ...(opts?.excludeId ? [opts.excludeId] : []),
  ]);
  const options: { value: string; label: string }[] = [];

  const walk = (parentId: string | null, prefix: string) => {
    const siblings = parentId
      ? childCategories(categories, parentId)
      : parentCategories(categories);
    for (const category of siblings) {
      if (exclude.has(category.id)) continue;
      const name = localeName(category);
      const label = prefix ? `${prefix} → ${name}` : name;
      options.push({ value: category.id, label });
      walk(category.id, label);
    }
  };

  walk(null, "");
  return options;
}

export function categoryAncestors(
  categoryId: string,
  categories: ProductCategory[],
): ProductCategory[] {
  const ancestors: ProductCategory[] = [];
  let current = categories.find((category) => category.id === categoryId);
  while (current?.parentId) {
    const parent = categories.find((category) => category.id === current!.parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export function categoryBreadcrumbChain(
  categoryId: string,
  categories: ProductCategory[],
): ProductCategory[] {
  const current = categories.find((category) => category.id === categoryId);
  if (!current) return [];
  return [...categoryAncestors(categoryId, categories), current];
}

export function categoryDepth(
  categoryId: string,
  categories: ProductCategory[],
): number {
  return categoryAncestors(categoryId, categories).length;
}

export function categoriesInTreeOrder(categories: ProductCategory[]): Array<{
  category: ProductCategory;
  depth: number;
}> {
  const rows: Array<{ category: ProductCategory; depth: number }> = [];

  const walk = (parentId: string | null, depth: number) => {
    const siblings = parentId
      ? childCategories(categories, parentId)
      : parentCategories(categories);
    for (const category of siblings) {
      rows.push({ category, depth });
      walk(category.id, depth + 1);
    }
  };

  walk(null, 0);
  return rows;
}

export function rootCategoryFor(
  categoryId: string,
  categories: ProductCategory[],
): ProductCategory | undefined {
  let current = categories.find((category) => category.id === categoryId);
  while (current?.parentId) {
    current = categories.find((category) => category.id === current!.parentId);
  }
  return current;
}

export function hasNestedChildren(
  categoryId: string,
  categories: ProductCategory[],
): boolean {
  return childCategories(categories, categoryId).some(
    (child) => childCategories(categories, child.id).length > 0,
  );
}

export function productsInCategory(
  categoryId: string,
  categories: ProductCategory[],
  productCategoryId: string,
) {
  if (productCategoryId === categoryId) return true;
  return descendantCategoryIds(categoryId, categories).includes(productCategoryId);
}

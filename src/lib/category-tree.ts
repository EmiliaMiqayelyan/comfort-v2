import type { ProductCategory } from "@/types";

export function parentCategories(categories: ProductCategory[]) {
  return categories.filter((category) => !category.parentId);
}

export function childCategories(categories: ProductCategory[], parentId: string) {
  return categories.filter((category) => category.parentId === parentId);
}

export function categorySelectOptions(
  categories: ProductCategory[],
  localeName: (category: ProductCategory) => string,
  opts?: { includeParents?: boolean; excludeId?: string },
) {
  const includeParents = opts?.includeParents ?? true;
  const options: { value: string; label: string }[] = [];
  for (const parent of parentCategories(categories)) {
    if (parent.id === opts?.excludeId) continue;
    if (includeParents) {
      options.push({ value: parent.id, label: localeName(parent) });
    }
    for (const child of childCategories(categories, parent.id)) {
      if (child.id === opts?.excludeId) continue;
      options.push({
        value: child.id,
        label: `${localeName(parent)} → ${localeName(child)}`,
      });
    }
  }
  return options;
}

export function productsInCategory(
  categoryId: string,
  categories: ProductCategory[],
  productCategoryId: string,
) {
  if (productCategoryId === categoryId) return true;
  return categories.some(
    (category) => category.id === productCategoryId && category.parentId === categoryId,
  );
}

import { asLocalized } from "@/lib/localized";
import { mediaSrc } from "@/lib/utils";
import type { ProductCategory } from "@/types";

/** Normalize category payloads from API (JSON strings, snake_case counts). */
export function normalizeCategory(raw: unknown): ProductCategory {
  const item = (raw ?? {}) as Record<string, unknown>;
  const productCount = Number(
    item.productCount ?? item.product_count ?? 0,
  );
  return {
    id: String(item.id ?? ""),
    slug: String(item.slug ?? ""),
    name: asLocalized(item.name),
    description: asLocalized(item.description),
    image: mediaSrc(typeof item.image === "string" ? item.image : null),
    parentId: (item.parentId as string | null | undefined) ?? null,
    productCount: Number.isFinite(productCount) ? productCount : 0,
  };
}

export function normalizeCategories(raw: unknown): ProductCategory[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeCategory)
    .filter((category) => category.id && category.slug);
}

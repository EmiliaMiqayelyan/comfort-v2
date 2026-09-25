"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CollectionCardGrid } from "@/components/molecules/collection-card";
import {
  useCategories,
  useCollections,
  useProducts,
} from "@/hooks/use-catalog";
import { productsInCategory } from "@/lib/category-tree";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";
import type { Collection, Product, ProductCategory } from "@/types";

export function CollectionsGrid({
  initialCollections,
  initialCategories,
  initialProducts,
}: {
  initialCollections?: Collection[];
  initialCategories?: ProductCategory[];
  /** Lightweight product list used only for category→collection filtering */
  initialProducts?: Product[];
}) {
  const t = useTranslations("collections");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const { data: collections = [] } = useCollections(initialCollections);
  const { data: products = [] } = useProducts(initialProducts);
  const { data: categories = [] } = useCategories(initialCategories);

  const filtered = useMemo(() => {
    if (!activeCategoryId) return collections;

    const matchingCollectionIds = new Set<string>();
    for (const product of products) {
      if (!productsInCategory(activeCategoryId, categories, product.categoryId)) {
        continue;
      }
      if (product.collectionIds?.length) {
        for (const id of product.collectionIds) matchingCollectionIds.add(id);
      } else if (product.collectionId) {
        matchingCollectionIds.add(product.collectionId);
      }
    }

    return collections.filter((col) => matchingCollectionIds.has(col.id));
  }, [activeCategoryId, categories, collections, products]);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
        <CategoryTreeNav
          categories={categories}
          activeCategoryId={activeCategoryId}
          defaultExpandFirst
          onSelect={setActiveCategoryId}
        />
      </aside>

      <div className="min-w-0">
        <Reveal className="mb-8">
          <p className="text-sm text-muted-foreground">
            {t("results", { count: filtered.length })}
          </p>
        </Reveal>

        <CollectionCardGrid collections={filtered} />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CollectionCard } from "@/components/molecules/collection-card";
import {
  useCategories,
  useCollections,
  useProducts,
} from "@/hooks/use-catalog";
import { productsInCategory } from "@/lib/category-tree";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";

export function CollectionsGrid() {
  const t = useTranslations("collections");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const { data: collections = [] } = useCollections();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

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
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0">
        <CategoryTreeNav
          categories={categories}
          activeCategoryId={activeCategoryId}
          expandAll
          onSelect={setActiveCategoryId}
        />
      </aside>

      <div className="min-w-0">
        <Reveal className="mb-8">
          <p className="text-sm text-muted-foreground">
            {t("results", { count: filtered.length })}
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {filtered.map((collection, i) => (
            <Reveal key={collection.id} delay={i * 0.06}>
              <CollectionCard collection={collection} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { getLocalized } from "@/data/catalog";
import {
  useCategories,
  useCollections,
  useProducts,
} from "@/hooks/use-catalog";
import { productsInCategory } from "@/lib/category-tree";
import { firstMedia, mediaSrc } from "@/lib/utils";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";

export function CollectionsGrid() {
  const t = useTranslations("collections");
  const locale = useLocale();
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

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((collection, i) => (
            <Reveal key={collection.id} delay={i * 0.06}>
              <Link
                href={`/collections/${collection.slug}`}
                className="catalog-panel catalog-shadow group relative flex flex-col overflow-hidden rounded-3xl border transition hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ecece8]">
                  <Image
                    src={mediaSrc(
                      firstMedia(collection.images) || collection.image,
                    )}
                    alt={getLocalized(collection.name, locale)}
                    fill
                    quality={95}
                    className="catalog-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6 md:p-8">
                  <h3 className="display text-xl text-foreground md:text-2xl">
                    {getLocalized(collection.name, locale)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {getLocalized(collection.description, locale)}
                  </p>
                  <p className="mt-auto pt-4 text-xs uppercase tracking-widest text-muted-foreground">
                    {t("products", { count: collection.productCount })}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

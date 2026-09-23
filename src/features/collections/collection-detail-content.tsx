"use client";

import { Suspense, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { getLocalized } from "@/data/catalog";
import { useProducts } from "@/hooks/use-catalog";
import { CollectionBreadcrumb } from "@/features/collections/collection-breadcrumb";
import { CatalogDetailContent } from "@/features/products/catalog-detail-content";
import type { Collection } from "@/types";

export function CollectionDetailContent({ collection }: { collection: Collection }) {
  const t = useTranslations("collections");
  const locale = useLocale();
  const { data: allProducts = [] } = useProducts();
  const collectionName = getLocalized(collection.name, locale);

  const collectionProducts = useMemo(
    () =>
      allProducts.filter(
        (product) =>
          product.collectionIds?.includes(collection.id) ||
          product.collectionId === collection.id,
      ),
    [allProducts, collection.id],
  );

  return (
    <div>
      <Suspense
        fallback={
          <nav
            aria-label="Breadcrumb"
            className="mb-10 text-sm text-muted-foreground"
          >
            <span className="font-medium text-foreground">{collectionName}</span>
          </nav>
        }
      >
        <CollectionBreadcrumb currentLabel={collectionName} />
      </Suspense>
      <CatalogDetailContent
        item={collection}
        footer={
          collectionProducts.length > 0 ? (
            <section className="mt-24 border-t border-border pt-24">
              <Reveal>
                <h2 className="display mb-12 text-2xl text-foreground md:text-3xl">
                  {t("title")}
                </h2>
              </Reveal>
              <ProductCardGrid products={collectionProducts} />
            </section>
          ) : null
        }
      />
    </div>
  );
}

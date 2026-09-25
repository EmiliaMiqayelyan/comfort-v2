"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { InfiniteProductGrid } from "@/components/molecules/infinite-product-grid";
import { getLocalized } from "@/data/catalog";
import { CollectionBreadcrumb } from "@/features/collections/collection-breadcrumb";
import { CatalogDetailContent } from "@/features/products/catalog-detail-content";
import type { PaginatedProducts } from "@/lib/api";
import type { Collection } from "@/types";

export function CollectionDetailContent({
  collection,
  initialProducts,
}: {
  collection: Collection;
  initialProducts: PaginatedProducts;
}) {
  const t = useTranslations("collections");
  const locale = useLocale();
  const collectionName = getLocalized(collection.name, locale);

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
          <section className="mt-24 border-t border-border pt-24">
            <Reveal>
              <h2 className="display mb-12 text-2xl text-foreground md:text-3xl">
                {t("title")}
              </h2>
            </Reveal>
            <InfiniteProductGrid
              filter={{ collection: collection.slug }}
              initial={initialProducts}
              path={`/collections/${collection.slug}`}
            />
          </section>
        }
      />
    </div>
  );
}

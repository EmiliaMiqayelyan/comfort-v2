"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { CollectionCardGrid } from "@/components/molecules/collection-card";
import { getLocalized } from "@/data/catalog";
import { useCategories, useCollections, useProducts } from "@/hooks/use-catalog";
import { CatalogDetailContent } from "@/features/products/catalog-detail-content";
import { CategoryBreadcrumb } from "@/features/products/category-breadcrumb";
import type { Product } from "@/types";

export function ProductDetailContent({ product }: { product: Product }) {
  const t = useTranslations("product");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();
  const { data: allProducts = [] } = useProducts();

  const productCollectionIds = product.collectionIds?.length
    ? product.collectionIds
    : product.collectionId
      ? [product.collectionId]
      : [];

  const linkedCollections = collections.filter((collection) =>
    productCollectionIds.includes(collection.id),
  );
  const category = categories.find((c) => c.id === product.categoryId);
  const productName = getLocalized(product.name, locale);

  const related = useMemo(
    () =>
      allProducts
        .filter(
          (p) =>
            p.id !== product.id &&
            (p.categoryId === product.categoryId ||
              p.collectionIds?.some((id) => productCollectionIds.includes(id)) ||
              (p.collectionId && productCollectionIds.includes(p.collectionId))),
        )
        .slice(0, 4),
    [allProducts, product, productCollectionIds],
  );

  const collectionsTitle = tAdmin.has("collections")
    ? tAdmin("collections")
    : locale === "am"
      ? "Աքսեսուարներ"
      : locale === "ru"
        ? "Аксессуары"
        : "Accessories";

  return (
    <div>
      <CategoryBreadcrumb
        category={category ?? null}
        categories={categories}
        currentLabel={productName}
      />
      <CatalogDetailContent
        item={product}
        footer={
          <>
            {linkedCollections.length > 0 && (
              <section className="mt-24 border-t border-border pt-24">
                <Reveal>
                  <h2 className="display mb-12 text-2xl text-foreground md:text-3xl">
                    {collectionsTitle}
                  </h2>
                </Reveal>
                <CollectionCardGrid
                  collections={linkedCollections}
                  fromProductSlug={product.slug}
                />
              </section>
            )}

            {related.length > 0 && (
              <section className="mt-24 border-t border-border pt-24">
                <Reveal>
                  <h2 className="display mb-12 text-2xl text-foreground md:text-3xl">
                    {t("related")}
                  </h2>
                </Reveal>
                <ProductCardGrid products={related} />
              </section>
            )}
          </>
        }
      />
    </div>
  );
}

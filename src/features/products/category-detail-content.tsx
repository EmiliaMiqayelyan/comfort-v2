"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { getLocalized } from "@/data/catalog";
import { useCategories, useProducts } from "@/hooks/use-catalog";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { childCategories } from "@/lib/category-tree";
import type { ProductCategory } from "@/types";

export function CategoryDetailContent({
  category,
}: {
  category: ProductCategory;
}) {
  const locale = useLocale();
  const tc = useTranslations("categories");
  const { data: allProducts = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const children = childCategories(categories, category.id);
  const directProducts = allProducts.filter((product) => product.categoryId === category.id);
  const isLeaf = children.length === 0;

  return (
    <div>
      {!isLeaf && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <CatalogCard
              key={child.id}
              href={`/products/${child.slug}`}
              image={child.image}
              title={getLocalized(child.name, locale)}
              description={getLocalized(child.description, locale)}
            />
          ))}
        </div>
      )}

      {isLeaf && directProducts.length > 0 && (
        <ProductCardGrid products={directProducts} />
      )}

      {isLeaf && directProducts.length === 0 && (
        <Reveal>
          <div className="rounded-[5px] border border-border bg-card p-12 text-center text-muted-foreground">
            {tc.has("noProducts") ? tc("noProducts") : "Այս կատեգորիայում դեռ ապրանքներ չկան։"}
          </div>
        </Reveal>
      )}
    </div>
  );
}

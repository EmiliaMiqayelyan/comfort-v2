"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { getLocalized } from "@/data/catalog";
import { useCategories, useProducts } from "@/hooks/use-catalog";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { childCategories, rootCategoryFor } from "@/lib/category-tree";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";
import { CategoryBreadcrumb } from "@/features/products/category-breadcrumb";
import type { ProductCategory } from "@/types";

export function CategoryDetailContent({
  category,
}: {
  category: ProductCategory;
}) {
  const locale = useLocale();
  const tp = useTranslations("product");
  const { data: allProducts = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const children = childCategories(categories, category.id);
  const rootCategory = rootCategoryFor(category.id, categories) ?? category;
  const showSidebar = childCategories(categories, rootCategory.id).length > 0;
  const directProducts = allProducts.filter((product) => product.categoryId === category.id);
  const isLeaf = children.length === 0;

  return (
    <div>
      <CategoryBreadcrumb category={category} categories={categories} />

      <Reveal className="mb-10">
        <h1 className="display text-3xl uppercase tracking-wide text-[#8B1A1A] md:text-4xl">
          {getLocalized(category.name, locale)}
        </h1>
      </Reveal>

      <div className={showSidebar ? "grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14" : ""}>
        {showSidebar && (
          <CategoryTreeNav
            rootCategory={rootCategory}
            categories={categories}
            activeCategoryId={category.id}
          />
        )}

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

          {isLeaf && (
            directProducts.length === 0 ? (
              <Reveal>
                <div className="rounded-3xl border border-border bg-card p-12 text-center text-muted-foreground">
                  {tp("related")}
                </div>
              </Reveal>
            ) : (
              <ProductCardGrid products={directProducts} />
            )
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CategoryCard } from "@/components/molecules/category-card";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { getLocalized } from "@/data/catalog";
import { useCategories, useProducts } from "@/hooks/use-catalog";
import { childCategories } from "@/lib/category-tree";
import { CategoryBreadcrumb } from "@/features/products/category-breadcrumb";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";
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
  const directProducts = allProducts.filter(
    (product) => product.categoryId === category.id,
  );
  const isLeaf = children.length === 0;
  const title = getLocalized(category.name, locale);
  const description = getLocalized(category.description, locale);

  return (
    <div>
      <CategoryBreadcrumb category={category} categories={categories} />

      <Reveal className="mb-8 md:mb-10">
        <h1 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {description}
          </p>
        ) : null}
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <CategoryTreeNav
            categories={categories}
            activeCategoryId={category.id}
          />
        </aside>

        <div className="min-w-0">
          {!isLeaf && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
              {children.map((child) => (
                <CategoryCard key={child.id} category={child} />
              ))}
            </div>
          )}

          {isLeaf && directProducts.length > 0 && (
            <ProductCardGrid
              products={directProducts}
              className="lg:grid-cols-2 xl:grid-cols-3"
            />
          )}

          {isLeaf && directProducts.length === 0 && (
            <Reveal>
              <div className="rounded-[5px] border border-border bg-card p-12 text-center text-muted-foreground">
                {tc.has("noProducts")
                  ? tc("noProducts")
                  : "Այս կատեգորիայում դեռ ապրանքներ չկան։"}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CategoryCard } from "@/components/molecules/category-card";
import { InfiniteProductGrid } from "@/components/molecules/infinite-product-grid";
import { getLocalized } from "@/data/catalog";
import { useCategories } from "@/hooks/use-catalog";
import { childCategories } from "@/lib/category-tree";
import { CategoryBreadcrumb } from "@/features/products/category-breadcrumb";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";
import {
  ProductFacetFilters,
  collectFacets,
} from "@/features/products/product-facet-filters";
import type { PaginatedProducts } from "@/lib/api";
import type { ProductCategory } from "@/types";

export function CategoryDetailContent({
  category,
  initialCategories,
  initialProducts,
}: {
  category: ProductCategory;
  initialCategories: ProductCategory[];
  initialProducts: PaginatedProducts;
}) {
  const locale = useLocale();
  const tc = useTranslations("categories");
  const { data: categories = initialCategories } = useCategories(initialCategories);
  const children = childCategories(categories, category.id);
  const isLeaf = children.length === 0;
  const title = getLocalized(category.name, locale);
  const description = getLocalized(category.description, locale);

  const [selected, setSelected] = useState<Record<string, string>>({});
  const options = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, value]) => Boolean(value))
        .map(([key, value]) => ({ key, value })),
    [selected],
  );

  const facets = useMemo(
    () => collectFacets(initialProducts.items, locale),
    [initialProducts.items, locale],
  );

  const setFacet = (key: string, value: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (!value || next[key] === value) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const clearFacets = () => setSelected({});
  const filterKey = options.map((o) => `${o.key}:${o.value}`).sort().join("|");

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

      <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
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

          {isLeaf && (
            <>
              <ProductFacetFilters
                facets={facets}
                selected={selected}
                onSelect={setFacet}
                onClear={clearFacets}
              />
              <InfiniteProductGrid
                key={filterKey || "all"}
                filter={{ category: category.slug, options }}
                initial={options.length === 0 ? initialProducts : null}
                path={`/products/${category.slug}`}
                className="lg:grid-cols-2 xl:grid-cols-3"
                emptyLabel={
                  options.length > 0
                    ? tc.has("noFilteredProducts")
                      ? tc("noFilteredProducts")
                      : locale === "am"
                        ? "Այս ֆիլտրերով ապրանքներ չկան։"
                        : locale === "ru"
                          ? "Нет товаров по выбранным фильтрам."
                          : "No products match these filters."
                    : undefined
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { cn } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import { useCategories, useProducts } from "@/hooks/use-catalog";
import { parentCategories, productsInCategory } from "@/lib/category-tree";

export function ProductsCatalog() {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const parents = parentCategories(categories);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    const category = categories.find((c) => c.slug === activeCategory);
    if (!category) return products;
    return products.filter((p) => productsInCategory(category.id, categories, p.categoryId));
  }, [activeCategory, products, categories]);

  return (
    <>
      <Reveal className="mb-10 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={cn(
            "rounded-full border px-5 py-2.5 text-sm transition",
            !activeCategory
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card text-muted-foreground hover:border-foreground/30",
          )}
        >
          {tc("all")}
        </button>
        {parents.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.slug)}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm transition",
              activeCategory === category.slug
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground/30",
            )}
          >
            {getLocalized(category.name, locale)}
          </button>
        ))}
      </Reveal>

      <div className="mb-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {parents.map((category) => (
          <CatalogCard
            key={category.id}
            href={`/products/${category.slug}`}
            image={category.image}
            title={getLocalized(category.name, locale)}
            description={getLocalized(category.description, locale)}
          />
        ))}
      </div>

      <Reveal className="mb-8">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} {tc("view").toLowerCase()}
        </p>
      </Reveal>

      <ProductCardGrid products={filteredProducts} />
    </>
  );
}

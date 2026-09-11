"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { getLocalized } from "@/data/catalog";
import { useCategories } from "@/hooks/use-catalog";
import { parentCategories } from "@/lib/category-tree";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";

export function ProductsCatalog() {
  const t = useTranslations("categories");
  const locale = useLocale();
  const { data: categories = [], isLoading } = useCategories();
  const roots = parentCategories(categories);

  if (isLoading || roots.length === 0) return null;

  return (
    <div>
      <Reveal className="mb-8 md:mb-10">
        <h1 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
          {t("title")}
        </h1>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0">
          <CategoryTreeNav categories={categories} expandAll />
        </aside>

        <div className="min-w-0 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {roots.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.08}>
              <CatalogCard
                href={`/products/${category.slug}`}
                image={category.image}
                title={getLocalized(category.name, locale)}
                description={getLocalized(category.description, locale)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

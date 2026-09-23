"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CategoryCard } from "@/components/molecules/category-card";
import { useCategories } from "@/hooks/use-catalog";
import { parentCategories } from "@/lib/category-tree";
import { CategoryTreeNav } from "@/features/products/category-tree-nav";

export function ProductsCatalog() {
  const t = useTranslations("categories");
  const { data: categories = [] } = useCategories();
  const roots = parentCategories(categories);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto">
        <CategoryTreeNav categories={categories} />
      </aside>

      <div className="min-w-0">
        <Reveal className="mb-8">
          <p className="text-sm text-muted-foreground">
            {t("results", { count: roots.length })}
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          {roots.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.08}>
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

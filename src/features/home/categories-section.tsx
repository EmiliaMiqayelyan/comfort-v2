"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CategoryCard } from "@/components/molecules/category-card";
import { useCategories } from "@/hooks/use-catalog";
import { parentCategories } from "@/lib/category-tree";

export function CategoriesSection() {
  const t = useTranslations("categories");
  const { data: categories = [], isLoading } = useCategories();
  const parents = parentCategories(categories);

  if (isLoading || parents.length === 0) return null;

  return (
    <section className="catalog-surface py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-12">
          <h2 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {parents.map((category, i) => (
            <Reveal key={category.id} delay={i * 0.08}>
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

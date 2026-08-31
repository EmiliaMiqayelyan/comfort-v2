"use client";

import { useLocale, useTranslations } from "next-intl";
import { Reveal } from "@/components/molecules/reveal";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { getLocalized } from "@/data/catalog";
import { useCategories } from "@/hooks/use-catalog";
import { parentCategories } from "@/lib/category-tree";

export function CategoriesSection() {
  const t = useTranslations("categories");
  const locale = useLocale();
  const { data: categories = [], isLoading } = useCategories();
  const parents = parentCategories(categories);

  if (isLoading || parents.length === 0) return null;

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-12">
          <h2 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {parents.map((category, i) => (
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
    </section>
  );
}

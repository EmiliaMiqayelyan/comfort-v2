"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { getLocalized } from "@/data/catalog";
import { categoryBreadcrumbChain } from "@/lib/category-tree";
import type { ProductCategory } from "@/types";

export function CategoryBreadcrumb({
  category,
  categories,
}: {
  category: ProductCategory;
  categories: ProductCategory[];
}) {
  const locale = useLocale();
  const t = useTranslations("categories");
  const chain = categoryBreadcrumbChain(category.id, categories);

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/products" className="transition hover:text-foreground">
            {t("title")}
          </Link>
        </li>
        {chain.map((item) => (
          <li key={item.id} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            {item.id === category.id ? (
              <span className="font-medium text-foreground">
                {getLocalized(item.name, locale)}
              </span>
            ) : (
              <Link
                href={`/products/${item.slug}`}
                className="transition hover:text-foreground"
              >
                {getLocalized(item.name, locale)}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

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
  currentLabel,
}: {
  category: ProductCategory | null;
  categories: ProductCategory[];
  /** When set (e.g. product name), category chain items are links and this is the current page. */
  currentLabel?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("categories");
  const chain = category
    ? categoryBreadcrumbChain(category.id, categories)
    : [];

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/products" className="transition hover:text-foreground">
            {t("title")}
          </Link>
        </li>
        {chain.map((item) => {
          const isLastCategory = item.id === category?.id;
          const isCurrent = isLastCategory && !currentLabel;

          return (
            <li key={item.id} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
              {isCurrent ? (
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
          );
        })}
        {currentLabel ? (
          <li className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span className="font-medium text-foreground">{currentLabel}</span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}

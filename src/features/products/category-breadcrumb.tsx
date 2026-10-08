"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronRight } from "lucide-react";
import { ChipSwiper } from "@/components/molecules/chip-swiper";
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
  const itemCount = 1 + chain.length + (currentLabel ? 1 : 0);

  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
      <ChipSwiper
        wrapperTag="ol"
        slideTag="li"
        spaceBetween={6}
        initialSlide={itemCount - 1}
        slideClassName="flex items-center gap-1.5 whitespace-nowrap"
      >
        <Link key="root" href="/products" className="transition hover:text-foreground">
          {t("title")}
        </Link>
        {chain.map((item) => {
          const isLastCategory = item.id === category?.id;
          const isCurrent = isLastCategory && !currentLabel;

          return (
            <span key={item.id} className="flex items-center gap-1.5">
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
            </span>
          );
        })}
        {currentLabel ? (
          <span key="current" className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span className="font-medium text-foreground">{currentLabel}</span>
          </span>
        ) : null}
      </ChipSwiper>
    </nav>
  );
}

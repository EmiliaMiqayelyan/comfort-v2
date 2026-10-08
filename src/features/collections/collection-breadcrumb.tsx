"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ChipSwiper } from "@/components/molecules/chip-swiper";
import { getLocalized } from "@/data/catalog";
import { useCategories, useProducts } from "@/hooks/use-catalog";
import { categoryBreadcrumbChain } from "@/lib/category-tree";

export function CollectionBreadcrumb({
  currentLabel,
}: {
  currentLabel: string;
}) {
  const locale = useLocale();
  const tCollections = useTranslations("collections");
  const tCategories = useTranslations("categories");
  const searchParams = useSearchParams();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const fromProductSlug =
    searchParams.get("from") === "product"
      ? searchParams.get("product")
      : null;
  const fromProduct = fromProductSlug
    ? products.find((product) => product.slug === fromProductSlug)
    : null;
  const productCategory = fromProduct
    ? categories.find((category) => category.id === fromProduct.categoryId)
    : null;
  const categoryChain = productCategory
    ? categoryBreadcrumbChain(productCategory.id, categories)
    : [];

  const current = (
    <span key="current" className="flex items-center gap-1.5">
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
      <span className="font-medium text-foreground">{currentLabel}</span>
    </span>
  );

  if (fromProduct) {
    return (
      <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted-foreground">
        <ChipSwiper
          wrapperTag="ol"
          slideTag="li"
          spaceBetween={6}
          initialSlide={categoryChain.length + 2}
          slideClassName="flex items-center gap-1.5 whitespace-nowrap"
        >
          <Link key="root" href="/products" className="transition hover:text-foreground">
            {tCategories("title")}
          </Link>
          {categoryChain.map((item) => (
            <span key={item.id} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <Link
                href={`/products/${item.slug}`}
                className="transition hover:text-foreground"
              >
                {getLocalized(item.name, locale)}
              </Link>
            </span>
          ))}
          <span key="product" className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <Link
              href={`/products/${fromProduct.slug}`}
              className="transition hover:text-foreground"
            >
              {getLocalized(fromProduct.name, locale)}
            </Link>
          </span>
          {current}
        </ChipSwiper>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted-foreground">
      <ChipSwiper
        wrapperTag="ol"
        slideTag="li"
        spaceBetween={6}
        initialSlide={1}
        slideClassName="flex items-center gap-1.5 whitespace-nowrap"
      >
        <Link key="root" href="/collections" className="transition hover:text-foreground">
          {tCollections("title")}
        </Link>
        {current}
      </ChipSwiper>
    </nav>
  );
}

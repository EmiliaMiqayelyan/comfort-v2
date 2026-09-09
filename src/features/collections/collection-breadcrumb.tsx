"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/routing";
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

  if (fromProduct) {
    return (
      <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/products" className="transition hover:text-foreground">
              {tCategories("title")}
            </Link>
          </li>
          {categoryChain.map((item) => (
            <li key={item.id} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <Link
                href={`/products/${item.slug}`}
                className="transition hover:text-foreground"
              >
                {getLocalized(item.name, locale)}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <Link
              href={`/products/${fromProduct.slug}`}
              className="transition hover:text-foreground"
            >
              {getLocalized(fromProduct.name, locale)}
            </Link>
          </li>
          <li className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span className="font-medium text-foreground">{currentLabel}</span>
          </li>
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-10 text-sm text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/collections" className="transition hover:text-foreground">
            {tCollections("title")}
          </Link>
        </li>
        <li className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
          <span className="font-medium text-foreground">{currentLabel}</span>
        </li>
      </ol>
    </nav>
  );
}

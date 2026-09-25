"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLenis } from "lenis/react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { Reveal } from "@/components/molecules/reveal";
import {
  useInfiniteProducts,
  type InfiniteProductsFilter,
} from "@/hooks/use-infinite-products";
import type { PaginatedProducts } from "@/lib/api";
import { cn } from "@/lib/utils";

type InfiniteProductGridProps = {
  filter: InfiniteProductsFilter;
  /** SSR first page; omit/null when filters force a fresh client fetch */
  initial?: PaginatedProducts | null;
  /** Path for crawlable next-page links, e.g. `/products/baseboards` */
  path: string;
  className?: string;
  emptyLabel?: string;
};

export function InfiniteProductGrid({
  filter,
  initial = null,
  path,
  className,
  emptyLabel,
}: InfiniteProductGridProps) {
  const locale = useLocale();
  const t = useTranslations("collections");
  const tc = useTranslations("categories");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, isPending } =
    useInfiniteProducts(filter, initial);

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? initial?.items ?? [],
    [data?.pages, initial?.items],
  );
  const total = data?.pages[0]?.total ?? initial?.total ?? 0;
  const lastPage = data?.pages[data.pages.length - 1] ?? initial;
  const nextPage = lastPage?.hasMore ? lastPage.page + 1 : null;

  // When infinite scroll appends cards, refresh Lenis scroll limits so
  // wheel inertia does not clamp against a stale document height.
  useEffect(() => {
    lenis?.resize();
  }, [lenis, products.length]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting) && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (products.length === 0 && !isFetching && !isPending) {
    return (
      <Reveal>
        <div className="rounded-[5px] border border-border bg-card p-12 text-center text-muted-foreground">
          {emptyLabel ??
            (tc.has("noProducts")
              ? tc("noProducts")
              : locale === "am"
                ? "Այս կատեգորիայում դեռ ապրանքներ չկան։"
                : locale === "ru"
                  ? "В этой категории пока нет товаров."
                  : "No products in this category yet.")}
        </div>
      </Reveal>
    );
  }

  return (
    <div>
      <Reveal className="mb-6">
        <p className="text-sm text-muted-foreground">
          {tc("results", { count: total })}
        </p>
      </Reveal>

      <ProductCardGrid products={products} className={className} />

      <div ref={sentinelRef} className="h-8 w-full" aria-hidden />

      {isFetchingNextPage || (isPending && products.length === 0) ? (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t.has("loadingMore")
            ? t("loadingMore")
            : locale === "am"
              ? "Բեռնվում է…"
              : locale === "ru"
                ? "Загрузка…"
                : "Loading…"}
        </p>
      ) : null}

      {/* Crawlable pagination for SEO / no-JS */}
      {(initial?.page ?? 1) > 1 || nextPage ? (
        <nav
          aria-label="Pagination"
          className={cn(
            "mt-8 flex justify-center gap-6",
            isFetchingNextPage && nextPage && "sr-only",
          )}
        >
          {(initial?.page ?? 1) > 1 ? (
            <Link
              href={
                (initial?.page ?? 1) <= 2
                  ? path
                  : `${path}?page=${(initial?.page ?? 1) - 1}`
              }
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-accent hover:underline"
              rel="prev"
              scroll={false}
            >
              {locale === "am" ? "Նախորդ" : locale === "ru" ? "Назад" : "Previous"}
            </Link>
          ) : null}
          {nextPage ? (
            <Link
              href={`${path}?page=${nextPage}`}
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
              rel="next"
              scroll={false}
            >
              {t("loadMore")}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

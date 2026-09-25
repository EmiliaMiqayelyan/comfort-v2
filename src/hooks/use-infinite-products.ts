"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  catalogApi,
  type PaginatedProducts,
  type ProductListQuery,
} from "@/lib/api";
import { CATALOG_PAGE_SIZE } from "@/lib/catalog-source";
import { normalizeProducts } from "@/lib/normalize";

export type InfiniteProductsFilter = {
  category?: string;
  collection?: string;
  options?: Array<{ key: string; value: string }>;
};

function emptyPage(page: number): PaginatedProducts {
  return {
    items: [],
    total: 0,
    page,
    pageSize: CATALOG_PAGE_SIZE,
    hasMore: false,
  };
}

export function useInfiniteProducts(
  filter: InfiniteProductsFilter,
  initial?: PaginatedProducts | null,
) {
  const optionsKey = (filter.options ?? [])
    .map((option) => `${option.key}:${option.value}`)
    .sort()
    .join("|");

  const canHydrate = Boolean(initial) && (filter.options?.length ?? 0) === 0;

  return useInfiniteQuery({
    queryKey: [
      "products-infinite",
      filter.category ?? null,
      filter.collection ?? null,
      optionsKey,
      canHydrate ? initial!.page : 1,
    ],
    queryFn: async ({ pageParam }) => {
      const query: ProductListQuery = {
        page: pageParam,
        limit: CATALOG_PAGE_SIZE,
        category: filter.category,
        collection: filter.collection,
        options: filter.options,
      };
      const page = await catalogApi.productsPage(query);
      if (!page) return emptyPage(pageParam);
      return {
        ...page,
        items: normalizeProducts(page.items ?? []),
      };
    },
    initialPageParam: initial?.page ?? 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    initialData: canHydrate && initial
      ? {
          pages: [initial],
          pageParams: [initial.page],
        }
      : undefined,
    staleTime: 60_000,
  });
}

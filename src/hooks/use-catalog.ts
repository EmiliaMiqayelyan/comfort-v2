"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { normalizeCollections, normalizePosts, normalizeProducts, normalizeProject } from "@/lib/normalize";
import { normalizeCategories } from "@/lib/normalize-category";
import type { Collection, Product, ProductCategory } from "@/types";

const CATALOG_STALE_MS = 120_000;

export function useProducts(initialData?: Product[]) {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => normalizeProducts((await catalogApi.products()) ?? []),
    staleTime: CATALOG_STALE_MS,
    initialData,
  });
}

export function useCategories(initialData?: ProductCategory[]) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => normalizeCategories((await catalogApi.categories()) ?? []),
    staleTime: CATALOG_STALE_MS,
    initialData,
  });
}

export function useCollections(initialData?: Collection[]) {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => normalizeCollections((await catalogApi.collections()) ?? []),
    staleTime: CATALOG_STALE_MS,
    initialData,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => ((await catalogApi.projects()) ?? []).map(normalizeProject),
    staleTime: CATALOG_STALE_MS,
  });
}

export function usePosts() {
  return useQuery({
    queryKey: ["blog"],
    queryFn: async () => normalizePosts((await catalogApi.posts()) ?? []),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useHeroSettings() {
  return useQuery({
    queryKey: ["hero-settings"],
    queryFn: async () => (await catalogApi.heroSettings()) ?? null,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}

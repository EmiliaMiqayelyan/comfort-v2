"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api";
import { normalizeProducts, normalizeProject } from "@/lib/normalize";
import { normalizeCategories } from "@/lib/normalize-category";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => normalizeProducts((await catalogApi.products()) ?? []),
    staleTime: 30_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => normalizeCategories((await catalogApi.categories()) ?? []),
    staleTime: 30_000,
  });
}

export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: async () => (await catalogApi.collections()) ?? [],
    staleTime: 30_000,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => ((await catalogApi.projects()) ?? []).map(normalizeProject),
    staleTime: 30_000,
  });
}

export function usePosts() {
  return useQuery({
    queryKey: ["blog"],
    queryFn: async () => (await catalogApi.posts()) ?? [],
    staleTime: 30_000,
  });
}

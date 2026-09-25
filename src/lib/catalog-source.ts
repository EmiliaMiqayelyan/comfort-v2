import { catalogApi, type PaginatedProducts, type ProductListQuery } from "@/lib/api";
import {
  normalizeCollection,
  normalizeCollections,
  normalizePost,
  normalizePosts,
  normalizeProduct,
  normalizeProducts,
  normalizeProject,
} from "@/lib/normalize";
import { normalizeCategories, normalizeCategory } from "@/lib/normalize-category";
import type { BlogPost, Collection, Product, ProductCategory, Project } from "@/types";

export const CATALOG_PAGE_SIZE = 24;

export async function loadProducts(): Promise<Product[]> {
  return normalizeProducts((await catalogApi.products()) ?? []);
}

export async function loadProductsPage(
  query: ProductListQuery = {},
): Promise<PaginatedProducts> {
  const page = await catalogApi.productsPage({
    limit: CATALOG_PAGE_SIZE,
    page: 1,
    ...query,
  });
  if (!page) {
    return {
      items: [],
      total: 0,
      page: query.page ?? 1,
      pageSize: query.limit ?? CATALOG_PAGE_SIZE,
      hasMore: false,
    };
  }
  return {
    ...page,
    items: normalizeProducts(page.items ?? []),
  };
}

export async function loadProduct(slug: string): Promise<Product | undefined> {
  const product = await catalogApi.product(slug);
  return product ? normalizeProduct(product) : undefined;
}

export async function loadCategories(): Promise<ProductCategory[]> {
  return normalizeCategories((await catalogApi.categories()) ?? []);
}

export async function loadCategory(slug: string): Promise<ProductCategory | undefined> {
  const category = await catalogApi.category(slug);
  return category ? normalizeCategory(category) : undefined;
}

export async function loadCollections(): Promise<Collection[]> {
  return normalizeCollections((await catalogApi.collections()) ?? []);
}

export async function loadCollection(slug: string): Promise<Collection | undefined> {
  const collection = await catalogApi.collection(slug);
  return collection ? normalizeCollection(collection) : undefined;
}

export async function loadProjects(): Promise<Project[]> {
  const projects = (await catalogApi.projects()) ?? [];
  return projects.map(normalizeProject);
}

export async function loadProject(slug: string): Promise<Project | undefined> {
  const project = await catalogApi.project(slug);
  return project ? normalizeProject(project) : undefined;
}

export async function loadPosts(): Promise<BlogPost[]> {
  return normalizePosts((await catalogApi.posts()) ?? []);
}

export async function loadPost(slug: string): Promise<BlogPost | undefined> {
  const post = await catalogApi.post(slug);
  return post ? normalizePost(post) : undefined;
}

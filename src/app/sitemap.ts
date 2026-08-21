import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import {
  loadCategories,
  loadCollections,
  loadPosts,
  loadProducts,
  loadProjects,
} from "@/lib/catalog-source";

const BASE = "https://comfort.am";

const STATIC_ROUTES = [
  "",
  "/products",
  "/collections",
  "/projects",
  "/about",
  "/production",
  "/downloads",
  "/blog",
  "/contact",
  "/calculator",
  "/visualizer",
  "/configurator",
  "/ar",
  "/partners",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections, projects, blogPosts] = await Promise.all([
    loadProducts(),
    loadCategories(),
    loadCollections(),
    loadProjects(),
    loadPosts(),
  ]);
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const route of STATIC_ROUTES) {
      entries.push({
        url: `${BASE}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.8,
      });
    }

    for (const category of categories) {
      entries.push({
        url: `${BASE}/${locale}/products/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }

    for (const product of products) {
      entries.push({
        url: `${BASE}/${locale}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const collection of collections) {
      entries.push({
        url: `${BASE}/${locale}/collections/${collection.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const project of projects) {
      entries.push({
        url: `${BASE}/${locale}/projects/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const post of blogPosts) {
      entries.push({
        url: `${BASE}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: "yearly",
        priority: 0.5,
      });
    }
  }

  return entries;
}

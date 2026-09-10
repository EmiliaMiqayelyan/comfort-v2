import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { defaultLocale } from "@/i18n/config";
import {
  loadCategories,
  loadCollections,
  loadPosts,
  loadProducts,
} from "@/lib/catalog-source";
import { languageAlternates, SITE_URL, siteUrl } from "@/lib/seo";

const STATIC_ROUTES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/products", changeFrequency: "weekly", priority: 0.9 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.85 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/production", changeFrequency: "monthly", priority: 0.75 },
  { path: "/downloads", changeFrequency: "monthly", priority: 0.75 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.75 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/calculator", changeFrequency: "monthly", priority: 0.65 },
  { path: "/visualizer", changeFrequency: "monthly", priority: 0.65 },
  { path: "/configurator", changeFrequency: "monthly", priority: 0.65 },
  { path: "/ar", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.7 },
  { path: "/legal/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/cookies", changeFrequency: "yearly", priority: 0.3 },
];

function entry(
  locale: string,
  path: string,
  options: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  } = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: siteUrl(locale, path),
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency ?? "monthly",
    priority: options.priority ?? 0.7,
    alternates: {
      languages: languageAlternates(path),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections, blogPosts] = await Promise.all([
    loadProducts(),
    loadCategories(),
    loadCollections(),
    loadPosts(),
  ]);
  const entries: MetadataRoute.Sitemap = [];

  // Prefer default locale first for crawl priority signals
  const orderedLocales = [
    defaultLocale,
    ...routing.locales.filter((locale) => locale !== defaultLocale),
  ];

  for (const locale of orderedLocales) {
    for (const route of STATIC_ROUTES) {
      entries.push(
        entry(locale, route.path, {
          changeFrequency: route.changeFrequency,
          priority: route.priority,
        }),
      );
    }

    for (const category of categories) {
      entries.push(
        entry(locale, `/products/${category.slug}`, {
          changeFrequency: "monthly",
          priority: 0.8,
        }),
      );
    }

    for (const product of products) {
      entries.push(
        entry(locale, `/products/${product.slug}`, {
          changeFrequency: "monthly",
          priority: 0.75,
        }),
      );
    }

    for (const collection of collections) {
      entries.push(
        entry(locale, `/collections/${collection.slug}`, {
          changeFrequency: "monthly",
          priority: 0.75,
        }),
      );
    }

    for (const post of blogPosts) {
      entries.push(
        entry(locale, `/blog/${post.slug}`, {
          lastModified: new Date(post.publishedAt),
          changeFrequency: "monthly",
          priority: 0.55,
        }),
      );
    }
  }

  // Root host entry for brand discovery
  entries.unshift({
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
    alternates: {
      languages: languageAlternates(""),
    },
  });

  return entries;
}

import type { Metadata } from "next";
import { defaultLocale, locales, type AppLocale } from "@/i18n/config";

export const SITE_URL = "https://comfort.am";
export const SITE_NAME = "Comfort";
export const SITE_TAGLINE = "Premium architectural interiors";

/** Default share image used when a page does not supply its own. */
export const DEFAULT_OG_IMAGE = "/images/about/about_comf.jpg";

export const OG_LOCALE: Record<AppLocale, string> = {
  en: "en_US",
  ru: "ru_RU",
  am: "hy_AM",
};

export const SITE_KEYWORDS = [
  "Comfort",
  "baseboards",
  "skirting boards",
  "3D wall panels",
  "moldings",
  "mouldings",
  "architectural profiles",
  "interior design Armenia",
  "Yerevan interiors",
  "wall panels",
  "decorative moldings",
] as const;

/** Build an absolute URL for a locale + path (`path` may be "" or "/products"). */
export function siteUrl(locale: string, path = ""): string {
  const normalized = path === "/" ? "" : path;
  const suffix = normalized
    ? normalized.startsWith("/")
      ? normalized
      : `/${normalized}`
    : "";
  return `${SITE_URL}/${locale}${suffix}`;
}

/** hreflang map including x-default → default locale. */
export function languageAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = siteUrl(locale, path);
  }
  languages["x-default"] = siteUrl(defaultLocale, path);
  return languages;
}

function resolveOgLocale(locale: string): string {
  return OG_LOCALE[(locale as AppLocale) in OG_LOCALE ? (locale as AppLocale) : defaultLocale];
}

function otherOgLocales(locale: string): string[] {
  return locales
    .filter((item) => item !== locale)
    .map((item) => OG_LOCALE[item]);
}

type BuildPageMetadataInput = {
  locale: string;
  path?: string;
  title: string;
  description: string;
  /** When true, title is used as-is (no "%s | Comfort" template). */
  absoluteTitle?: boolean;
  images?: string | string[];
  keywords?: string | string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
};

/**
 * Shared page metadata: canonical, hreflang, Open Graph, Twitter.
 * Pass titles without the brand suffix - the root template adds "| Comfort".
 */
export function buildPageMetadata({
  locale,
  path = "",
  title,
  description,
  absoluteTitle = false,
  images,
  keywords,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: BuildPageMetadataInput): Metadata {
  const url = siteUrl(locale, path);
  const imageList = (Array.isArray(images) ? images : images ? [images] : [DEFAULT_OG_IMAGE]).map(
    (src) => (src.startsWith("http") ? src : src),
  );
  const ogImages = imageList.map((src) => ({
    url: src,
    width: 1200,
    height: 630,
    alt: title,
  }));

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords: keywords ?? [...SITE_KEYWORDS],
    authors: authors?.map((name) => ({ name })),
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Architecture & Interior Design",
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: resolveOgLocale(locale),
      alternateLocale: otherOgLocales(locale),
      images: ogImages,
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageList,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

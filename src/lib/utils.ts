import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number,
  locale: string = "en",
  currency: string = "AMD",
) {
  return new Intl.NumberFormat(locale === "am" ? "hy-AM" : locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const FALLBACK_MEDIA = "/products/plinth.png";

/**
 * Normalize API media fields that may arrive as a real array, a JSON string,
 * or a single URL string (MySQL/JSON driver quirks).
 */
export function mediaList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return [];
    if (trimmed.startsWith("[")) {
      try {
        return mediaList(JSON.parse(trimmed) as unknown);
      } catch {
        /* fall through — treat as a plain URL */
      }
    }
    return [trimmed];
  }
  return [];
}

export function firstMedia(value: unknown, fallback = FALLBACK_MEDIA) {
  return mediaSrc(mediaList(value)[0], fallback);
}

/** Normalize JSON columns that may arrive as arrays or JSON strings. */
export function jsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "null" || trimmed === "undefined") return [];
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      return [];
    }
  }
  return [];
}

/** Safe src for next/image — empty or invalid values crash URL parsing. */
export function mediaSrc(value: string | null | undefined, fallback = FALLBACK_MEDIA) {
  if (typeof value !== "string") return fallback;
  const src = value.trim();
  if (!src || src === "null" || src === "undefined") return fallback;
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) return src;
  try {
    // Absolute http(s) URLs must parse.
    const url = new URL(src);
    if (url.protocol === "http:" || url.protocol === "https:") return src;
  } catch {
    return fallback;
  }
  return fallback;
}

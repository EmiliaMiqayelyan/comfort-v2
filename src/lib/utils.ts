import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, locale: string = "en") {
  const digits = Math.round(amount).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  return locale === "en" ? `AMD ${digits}` : `${digits} ֏`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const FALLBACK_MEDIA = "/products/plinth.jpg";

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

/** Resolve admin-uploaded `/uploads/...` paths for browser + next/image. */
export function resolveUploadSrc(src: string) {
  if (!src.startsWith("/uploads/")) return src;
  // Same-origin `/uploads` is proxied to the API by `src/app/uploads/[...path]/route.ts`.
  return src;
}

/** Base URL for uploaded assets (`/uploads/...`). */
export function uploadsBaseUrl() {
  if (typeof window !== "undefined") {
    const publicApi = process.env.NEXT_PUBLIC_API_URL || "/api";
    if (publicApi.startsWith("http")) {
      return publicApi.replace(/\/api\/?$/, "");
    }
    return window.location.origin;
  }
  return (process.env.API_URL || "http://127.0.0.1:4000/api").replace(/\/api\/?$/, "");
}

/** Full browser URL for an uploaded asset path. */
export function uploadAssetSrc(path: string) {
  const normalized = mediaSrc(path, "");
  if (!normalized) return "";
  if (
    normalized.startsWith("http") ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }
  if (normalized.startsWith("/uploads/")) {
    return `${uploadsBaseUrl()}${normalized}`;
  }
  if (normalized.startsWith("/")) {
    return typeof window !== "undefined"
      ? `${window.location.origin}${normalized}`
      : normalized;
  }
  return normalized;
}

export function isImageMedia(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const base = trimmed.split("?")[0];
  if (/\.(png|jpe?g|webp|gif|svg|avif|bmp)$/i.test(base)) return true;
  if (trimmed.startsWith("/uploads/") || base.includes("/uploads/")) return true;
  if (trimmed.startsWith("/products/")) return true;
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("blob:")) return true;
  return /^https?:\/\//i.test(trimmed);
}

/** Safe src for next/image — empty or invalid values crash URL parsing. */
export function mediaSrc(value: string | null | undefined, fallback = FALLBACK_MEDIA) {
  if (typeof value !== "string") return fallback;
  let src = value.trim();
  if (!src || src === "null" || src === "undefined") return fallback;

  // Absolute API upload URLs → same-origin path via Next `/uploads` proxy.
  try {
    const asUrl = new URL(src);
    if (
      (asUrl.protocol === "http:" || asUrl.protocol === "https:") &&
      asUrl.pathname.startsWith("/uploads/")
    ) {
      src = asUrl.pathname;
    }
  } catch {
    /* not an absolute URL */
  }

  if (src.startsWith("uploads/")) src = `/${src}`;

  // Legacy stub asset is nearly blank — use the real photo instead.
  if (src === "/products/plinth.png" || src.endsWith("/products/plinth.png")) {
    return fallback;
  }

  if (src.startsWith("/uploads/")) return resolveUploadSrc(src);
  if (src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) return src;
  try {
    const url = new URL(src);
    if (url.protocol === "http:" || url.protocol === "https:") return src;
  } catch {
    return fallback;
  }
  return fallback;
}

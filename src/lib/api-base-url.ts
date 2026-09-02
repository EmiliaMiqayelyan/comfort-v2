const DEFAULT_API_PORT = "4871";
const DEFAULT_WEB_PORT = "3847";

/** Normalize env API URL to always end with `/api`. */
function normalizeApiUrl(url: string) {
  const trimmed = url.trim().replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

/**
 * Resolve the API base URL at call time (not module init).
 * Browser: same-origin `/api` proxy.
 * Server: direct Express URL, with production-safe fallbacks.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  if (process.env.API_URL?.trim()) {
    return normalizeApiUrl(process.env.API_URL);
  }

  const apiPort = process.env.API_PORT || DEFAULT_API_PORT;
  return `http://127.0.0.1:${apiPort}/api`;
}

/** Origin for Express uploads (no `/api` suffix). */
export function getApiOrigin(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, "") || `http://127.0.0.1:${process.env.API_PORT || DEFAULT_API_PORT}`;
}

export function getWebPort(): string {
  return process.env.PORT || process.env.WEB_PORT || DEFAULT_WEB_PORT;
}

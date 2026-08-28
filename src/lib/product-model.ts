export const DEFAULT_PRODUCT_MODEL_URL = "/models/retro.glb";

const MODEL_EXT_PATTERN = /\.(glb|gltf)(\?.*)?$/i;
const IMAGE_EXT_PATTERN = /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i;

export function resolveProductModelUrl(url?: string | null): string | null {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return null;
  if (IMAGE_EXT_PATTERN.test(trimmed)) return null;
  if (MODEL_EXT_PATTERN.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/models/")) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return null;
  return null;
}

export function isValidModelUrl(url?: string | null): boolean {
  return resolveProductModelUrl(url) !== null;
}

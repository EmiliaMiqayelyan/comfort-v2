/** Catalog upload targets: sharp enough for detail pages, light enough to upload reliably. */
const MAX_EDGE = 2560;
const QUALITY = 0.86;
/** Skip recompression when the file is already small enough. */
const SKIP_UNDER_BYTES = 900_000;

const SKIP_TYPES = new Set([
  "image/svg+xml",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

function preferredMime(): string {
  if (typeof document === "undefined") return "image/jpeg";
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp")
    ? "image/webp"
    : "image/jpeg";
}

function extensionFor(mime: string) {
  if (mime === "image/webp") return ".webp";
  if (mime === "image/png") return ".png";
  return ".jpg";
}

function rename(fileName: string, mime: string) {
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return `${base}${extensionFor(mime)}`;
}

/**
 * Downscale and recompress admin image uploads in the browser before POST /media.
 * Keeps SVGs / GIFs / non-images untouched. Falls back to the original file on failure.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || SKIP_TYPES.has(file.type)) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const alreadyCompact = file.size <= SKIP_UNDER_BYTES && longest <= MAX_EDGE;
    if (alreadyCompact) {
      bitmap.close();
      return file;
    }

    const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const mime = preferredMime();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mime, QUALITY);
    });

    if (!blob || blob.size === 0) return file;
    // Prefer original only when recompression somehow got larger.
    if (blob.size >= file.size && longest <= MAX_EDGE) return file;

    return new File([blob], rename(file.name, mime), {
      type: mime,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

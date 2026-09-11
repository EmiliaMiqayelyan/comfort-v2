import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/** Longest edge for catalog stills - enough for retina product/detail views. */
const MAX_EDGE = 2560;
/** WebP quality: high visual fidelity without multi-MB uploads. */
const WEBP_QUALITY = 85;

const SKIP_MIME = new Set([
  'image/svg+xml',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);

export type OptimizedUpload = {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  originalname: string;
};

/**
 * Normalize raster uploads with sharp: EXIF rotate, max 2560px edge, WebP @ 85.
 * Leaves SVG / GIF / non-images unchanged. On failure, returns the original file.
 */
export async function optimizeUploadedImage(
  file: Express.Multer.File,
): Promise<OptimizedUpload> {
  const base = {
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    originalname: file.originalname,
  };

  if (!file.mimetype.startsWith('image/') || SKIP_MIME.has(file.mimetype)) {
    return base;
  }

  const outName = `${path.parse(file.filename).name}.webp`;
  const outPath = path.join(path.dirname(file.path), outName);

  try {
    const info = await sharp(file.path, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(outPath);

    if (outPath !== file.path) {
      await fs.unlink(file.path).catch(() => undefined);
    }

    const originalBase = file.originalname.replace(/\.[^.]+$/, '') || 'image';
    return {
      filename: outName,
      path: outPath,
      size: info.size,
      mimetype: 'image/webp',
      originalname: `${originalBase}.webp`,
    };
  } catch {
    await fs.unlink(outPath).catch(() => undefined);
    return base;
  }
}

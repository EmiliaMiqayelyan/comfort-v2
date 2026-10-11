"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Align = "left" | "center";

type CutoutPlan =
  | { type: "alpha" }
  | { type: "knockout"; maskUrl: string }
  | { type: "skip" };

const planCache = new Map<string, Promise<CutoutPlan>>();

function cssUrl(value: string) {
  return `url("${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`;
}

function hasUsefulAlpha(data: Uint8ClampedArray) {
  const stride = 4 * 8;
  let transparent = 0;
  let samples = 0;
  for (let i = 0; i < data.length; i += stride) {
    samples += 1;
    if (data[i + 3] < 245) transparent += 1;
  }
  return samples > 0 && transparent / samples > 0.015;
}

function isBackdrop(data: Uint8ClampedArray, index: number) {
  const offset = index * 4;
  const alpha = data[offset + 3];
  if (alpha < 245) return true;
  const r = data[offset];
  const g = data[offset + 1];
  const b = data[offset + 2];
  const max = r > g ? (r > b ? r : b) : g > b ? g : b;
  const min = r < g ? (r < b ? r : b) : g < b ? g : b;
  return max >= 250 && max - min <= 8;
}

/** Removes a flat white backdrop that is connected to the image edge. */
function knockOutBackdrop(data: Uint8ClampedArray, width: number, height: number) {
  const count = width * height;
  let border = 0;
  let borderBackdrop = 0;
  const consider = (x: number, y: number) => {
    border += 1;
    if (isBackdrop(data, y * width + x)) borderBackdrop += 1;
  };
  for (let x = 0; x < width; x += 1) {
    consider(x, 0);
    consider(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    consider(0, y);
    consider(width - 1, y);
  }
  if (border === 0 || borderBackdrop / border < 0.65) return false;

  const seen = new Uint8Array(count);
  const stack = new Int32Array(count);
  let top = 0;
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index] || !isBackdrop(data, index)) return;
    seen[index] = 1;
    stack[top] = index;
    top += 1;
  };

  for (let x = 0; x < width; x += 1) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    push(0, y);
    push(width - 1, y);
  }

  while (top > 0) {
    top -= 1;
    const index = stack[top];
    const x = index % width;
    const y = (index - x) / width;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }

  let cleared = 0;
  for (let index = 0; index < count; index += 1) {
    if (seen[index]) cleared += 1;
  }
  if (cleared < count * 0.04 || cleared > count * 0.97) return false;

  for (let index = 0; index < count; index += 1) {
    if (seen[index]) data[index * 4 + 3] = 0;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (seen[index]) continue;
      const touches =
        (x > 0 && seen[index - 1]) ||
        (x + 1 < width && seen[index + 1]) ||
        (y > 0 && seen[index - width]) ||
        (y + 1 < height && seen[index + width]);
      if (!touches) continue;
      const offset = index * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      const max = r > g ? (r > b ? r : b) : g > b ? g : b;
      const min = r < g ? (r < b ? r : b) : g < b ? g : b;
      if (max < 236 || max - min > 14) continue;
      const whiteness = (max - 236) / (255 - 236);
      data[offset + 3] = Math.round(data[offset + 3] * (1 - whiteness));
    }
  }

  return true;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    if (/^https?:/i.test(src)) {
      try {
        const url = new URL(src, window.location.href);
        if (url.origin !== window.location.origin) image.crossOrigin = "anonymous";
      } catch {
        /* keep the default request */
      }
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("cutout image failed"));
    image.src = src;
  });
}

async function computeCutoutPlan(src: string): Promise<CutoutPlan> {
  const image = await loadImage(src);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  if (!longest) return { type: "skip" };

  const scale = Math.min(1, 1600 / longest);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { type: "skip" };

  context.drawImage(image, 0, 0, width, height);
  let pixels: ImageData;
  try {
    pixels = context.getImageData(0, 0, width, height);
  } catch {
    return { type: "skip" };
  }

  if (hasUsefulAlpha(pixels.data)) return { type: "alpha" };
  if (!knockOutBackdrop(pixels.data, width, height)) return { type: "skip" };

  context.putImageData(pixels, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) return { type: "skip" };
  return { type: "knockout", maskUrl: URL.createObjectURL(blob) };
}

function resolveCutoutPlan(src: string) {
  const cached = planCache.get(src);
  if (cached) return cached;
  const pending = computeCutoutPlan(src).catch(() => ({ type: "skip" }) as CutoutPlan);
  planCache.set(src, pending);
  return pending;
}

/**
 * Product photo with a floor contact shadow.
 * The shadow is the PNG silhouette, blurred in layers and shifted down,
 * so it follows the molding instead of the rectangular frame.
 */
export function ProductCutoutImage({
  src,
  alt,
  align = "left",
  shadow = true,
  className,
  sizes,
  quality = 80,
  unoptimized,
  priority,
  loading,
  onLoad,
}: {
  src: string;
  alt: string;
  align?: Align;
  shadow?: boolean;
  className?: string;
  sizes: string;
  quality?: number;
  unoptimized?: boolean;
  priority?: boolean;
  loading?: "eager" | "lazy";
  onLoad?: () => void;
}) {
  const [plan, setPlan] = useState<CutoutPlan | null>(null);

  useEffect(() => {
    if (!shadow) {
      setPlan(null);
      return;
    }
    let cancelled = false;
    setPlan(null);
    const start = () => {
      resolveCutoutPlan(src).then((next) => {
        if (!cancelled) setPlan(next);
      });
    };
    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(start)
        : window.setTimeout(start, 1);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
    };
  }, [shadow, src]);

  const maskUrl =
    plan?.type === "knockout" ? plan.maskUrl : plan?.type === "alpha" ? src : null;

  return (
    <div
      className={cn(
        "product-cutout-frame absolute inset-0",
        align === "left" && "is-left",
      )}
      style={
        maskUrl
          ? ({ "--cutout": cssUrl(maskUrl) } as React.CSSProperties)
          : undefined
      }
    >
      {maskUrl ? (
        <div className="product-cutout-shadow-clip" aria-hidden>
          <div className="product-cutout-shadow product-cutout-shadow--ambient">
            <div className="product-cutout-shadow-shape" />
          </div>
          <div className="product-cutout-shadow product-cutout-shadow--soft">
            <div className="product-cutout-shadow-shape" />
          </div>
          <div className="product-cutout-shadow product-cutout-shadow--contact">
            <div className="product-cutout-shadow-shape" />
          </div>
        </div>
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        quality={quality}
        unoptimized={unoptimized}
        priority={priority}
        loading={loading}
        sizes={sizes}
        onLoad={onLoad}
        className={cn(
          "z-[1]",
          plan?.type === "knockout" && "product-cutout-punch",
          className,
        )}
      />
    </div>
  );
}

import { PNG } from "pngjs";
import { createReadStream, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const srcPath = resolve(root, "public/brand/comfort-logo-src.png");

function loadPng(path) {
  return new Promise((resolveP, reject) => {
    createReadStream(path)
      .pipe(new PNG({ filterType: 4 }))
      .on("parsed", function () {
        resolveP(this);
      })
      .on("error", reject);
  });
}

function isBackground(r, g, b, a) {
  if (a < 16) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // black / near-black canvas
  if (max < 28) return true;
  // light beige / white canvas
  if (min > 210 && max - min < 40) return true;
  return false;
}

const src = await loadPng(srcPath);
let minX = src.width;
let minY = src.height;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < src.height; y++) {
  for (let x = 0; x < src.width; x++) {
    const i = (src.width * y + x) << 2;
    const r = src.data[i];
    const g = src.data[i + 1];
    const b = src.data[i + 2];
    const a = src.data[i + 3];
    if (isBackground(r, g, b, a)) continue;
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
}

if (maxX < minX) {
  throw new Error("No logo pixels found");
}

const pad = 8;
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(src.width - 1, maxX + pad);
maxY = Math.min(src.height - 1, maxY + pad);

const width = maxX - minX + 1;
const height = maxY - minY + 1;
const out = new PNG({ width, height, colorType: 6 });

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const si = (src.width * (minY + y) + (minX + x)) << 2;
    const di = (width * y + x) << 2;
    const r = src.data[si];
    const g = src.data[si + 1];
    const b = src.data[si + 2];
    const a = src.data[si + 3];
    if (isBackground(r, g, b, a)) {
      out.data[di] = 0;
      out.data[di + 1] = 0;
      out.data[di + 2] = 0;
      out.data[di + 3] = 0;
    } else {
      out.data[di] = r;
      out.data[di + 1] = g;
      out.data[di + 2] = b;
      out.data[di + 3] = 255;
    }
  }
}

const pngPath = resolve(root, "public/brand/comfort-logo.png");
const buffer = PNG.sync.write(out, { colorType: 6 });
writeFileSync(pngPath, buffer);

function toSvg(pngBuffer, w, h) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="comfort">
  <image href="data:image/png;base64,${pngBuffer.toString("base64")}" width="${w}" height="${h}"/>
</svg>
`;
}

writeFileSync(resolve(root, "public/brand/comfort-logo.svg"), toSvg(buffer, width, height));

console.log(
  JSON.stringify(
    {
      source: { width: src.width, height: src.height },
      crop: { minX, minY, maxX, maxY, width, height },
      pngBytes: buffer.length,
    },
    null,
    2,
  ),
);

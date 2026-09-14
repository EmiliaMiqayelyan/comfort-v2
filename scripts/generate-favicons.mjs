import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "public/brand/comfort-logo.png");
const BG = { r: 11, g: 11, b: 11, alpha: 1 }; // #0B0B0B

const meta = await sharp(SRC).metadata();
const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const rowCounts = [];
for (let y = 0; y < info.height; y++) {
  let c = 0;
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 16) c++;
  }
  rowCounts.push(c);
}

// Gap between emblem and wordmark
let gapStart = null;
let bestGap = null;
for (let y = 0; y < info.height; y++) {
  const sparse = rowCounts[y] < info.width * 0.05;
  if (sparse) {
    if (gapStart == null) gapStart = y;
  } else if (gapStart != null) {
    const len = y - gapStart;
    if ((!bestGap || len > bestGap.len) && gapStart > info.height * 0.3) {
      bestGap = { start: gapStart, end: y - 1, len };
    }
    gapStart = null;
  }
}

const emblemBottom = bestGap ? bestGap.start - 1 : Math.floor(info.height * 0.65);
let minX = info.width;
let minY = info.height;
let maxX = 0;
let maxY = 0;
for (let y = 0; y <= emblemBottom; y++) {
  for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 16) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

console.log({ meta: { width: meta.width, height: meta.height }, bestGap, crop: { minX, minY, maxX, maxY } });

const emblem = await sharp(SRC)
  .extract({
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  })
  .trim({ threshold: 10 })
  .toBuffer({ resolveWithObject: true });

console.log("emblem trimmed", emblem.info);

async function makeIcon(size, outPath, paddingRatio = 0.14) {
  const pad = Math.round(size * paddingRatio);
  const inner = Math.max(1, size - pad * 2);

  // Paint the mark cream (#f7f4ef) using its alpha mask so it reads on dark UI,
  // matching BrandLogo inverted treatment.
  const resized = await sharp(emblem.data)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(resized.data);
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3];
    if (a < 8) {
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 0;
      continue;
    }
    pixels[i] = 247;
    pixels[i + 1] = 244;
    pixels[i + 2] = 239;
    // keep original alpha
  }

  const mark = await sharp(pixels, {
    raw: {
      width: resized.info.width,
      height: resized.info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(outPath);

  console.log("wrote", outPath.replace(root + "\\", "").replace(root + "/", ""), size);
}

await makeIcon(16, resolve(root, "public/favicon-16.png"), 0.12);
await makeIcon(32, resolve(root, "public/favicon-32.png"), 0.12);
await makeIcon(48, resolve(root, "public/favicon.png"), 0.12);
await makeIcon(180, resolve(root, "public/apple-touch-icon.png"), 0.14);
await makeIcon(192, resolve(root, "public/icon-192.png"), 0.14);
await makeIcon(512, resolve(root, "public/icon-512.png"), 0.14);

// Self-contained SVG favicon (no external image fetch - browsers block those)
const svgPng = await sharp(resolve(root, "public/favicon-32.png")).png().toBuffer();
const b64 = svgPng.toString("base64");
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Comfort">
  <image href="data:image/png;base64,${b64}" width="32" height="32"/>
</svg>
`;
writeFileSync(resolve(root, "public/favicon.svg"), svg);
console.log("wrote public/favicon.svg");

await makeIcon(32, resolve(root, "src/app/icon.png"), 0.12);
await makeIcon(180, resolve(root, "src/app/apple-icon.png"), 0.14);
console.log("done");

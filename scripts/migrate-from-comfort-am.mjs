#!/usr/bin/env node
/**
 * Migrate comfort.am MongoDB catalog (newproducts) into comfort-v2 MySQL.
 *
 * Expected inputs on this server:
 *   /root/comfort-migration/newproducts.json
 *   /root/comfort-migration/homeproducts.json
 *   /var/www/comfort/server/uploads/legacy/...  (copied image files)
 *
 * Mapping:
 *   productName_*  -> L1 parent Category
 *   subName_*      -> L2 Category (when present)
 *   nestedName_*   -> L3 Category when subName exists (navbar needs this level);
 *                     L2 when subName is empty (Suspended ceilings / Ribbons / Windowsill)
 *   leaf           -> Product under deepest category; title = nested or sub name (no duplication)
 *   accessories images only -> Collection: mock title from product name; images only
 *   colorCodes CSV -> split into per-swatch names
 *   images: prefer AM, then EN, then RU, then generic (deduped)
 *
 * Read-only vs old VPS: this script only reads local JSON + local legacy images.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const mysql = require("/var/www/comfort/server/node_modules/mysql2/promise");

const ROOT = "/root/comfort-migration";
const UPLOADS_LEGACY = "/var/www/comfort/server/uploads/legacy";
const PUBLIC_PREFIX = "/uploads/legacy";

const MYSQL = {
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || "comfort",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "comfort",
};

if (!MYSQL.password) {
  console.error("Set MYSQL_PASSWORD (and optionally MYSQL_* ) before running.");
  process.exit(1);
}

function uuid() {
  return crypto.randomUUID();
}

function loc(am, en, ru) {
  return {
    am: (am || en || ru || "").toString().trim(),
    en: (en || am || ru || "").toString().trim(),
    ru: (ru || en || am || "").toString().trim(),
  };
}

function slugify(input, fallback = "item") {
  const map = {
    ա: "a", բ: "b", գ: "g", դ: "d", ե: "e", զ: "z", է: "e", ը: "y", թ: "t",
    ժ: "zh", ի: "i", լ: "l", խ: "kh", ծ: "ts", կ: "k", հ: "h", ձ: "dz", ղ: "gh",
    ճ: "ch", մ: "m", յ: "y", ն: "n", շ: "sh", ո: "o", չ: "ch", պ: "p", ջ: "j",
    ռ: "r", ս: "s", վ: "v", տ: "t", ր: "r", ց: "c", ու: "u", փ: "p", ք: "q",
    և: "ev", օ: "o", ֆ: "f",
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  let s = (input || "").toString().trim().toLowerCase();
  s = s.replace(/ու/g, "u");
  s = s
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
  s = s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
  return s || fallback;
}

function uniqueSlug(base, used) {
  let slug = slugify(base);
  let i = 2;
  while (used.has(slug)) {
    slug = `${slugify(base).slice(0, 120)}-${i}`;
    i += 1;
  }
  used.add(slug);
  return slug;
}

function asArray(v) {
  if (Array.isArray(v)) return v.filter((x) => x != null && String(x).trim() !== "");
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function toPublicUrl(rel) {
  if (!rel || typeof rel !== "string") return null;
  let p = rel.trim().replace(/\\/g, "/");
  if (!p) return null;
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("/uploads/")) {
    return p;
  }
  if (p.startsWith("uploads/")) p = p.slice("uploads/".length);
  const abs = path.join(UPLOADS_LEGACY, p);
  if (!fs.existsSync(abs)) return null;
  return `${PUBLIC_PREFIX}/${p}`;
}

function firstExistingUrl(rels) {
  for (const rel of asArray(rels)) {
    const url = toPublicUrl(rel);
    if (url) return url;
  }
  return null;
}

/** Fallback cover when homepage image path is missing on disk. */
function parentCoverFallback(parentKey) {
  const candidates = {
    "suspended ceilings": [
      "uploads/ceilingGroup.jpg",
      "uploads/compressed/ceilingGroup.jpg.webp",
      "uploads/Կախովի առաստաղ.jpg.webp",
      "uploads/compressed/Կախովի առաստաղ.jpg.webp",
    ],
    ribbons: ["uploads/եզրաժապավեն 2.jpg", "uploads/1-ին էջ եզրաժապավեն .jpg"],
    windowsill: ["uploads/patuhanagog.jpg", "uploads/Պատուհանագոգ.jpg"],
  };
  return firstExistingUrl(candidates[parentKey] || []);
}

/** Prefer AM gallery, then EN/RU/generic; keep order, dedupe. */
function pickImages(leaf) {
  const buckets = [
    asArray(leaf.images_am),
    asArray(leaf.generic_image),
    asArray(leaf.images_en),
    asArray(leaf.images_ru),
    asArray(leaf.montagesImages_am),
    asArray(leaf.montagesImages_en),
    asArray(leaf.montagesImages_ru),
  ];
  const out = [];
  const seen = new Set();
  for (const bucket of buckets) {
    for (const rel of bucket) {
      const url = toPublicUrl(rel);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

function pickAccessoryImages(leaf) {
  const buckets = [
    asArray(leaf.accessoriesImages_am),
    asArray(leaf.accessoriesImages_en),
    asArray(leaf.accessoriesImages_ru),
    asArray(leaf.fittingsImages),
    asArray(leaf.fittingsMoreImages),
  ];
  const out = [];
  const seen = new Set();
  for (const bucket of buckets) {
    for (const rel of bucket) {
      const url = toPublicUrl(rel);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

function expandColorCodes(raw, imageCount) {
  const items = asArray(raw).map((item) => String(item).trim()).filter(Boolean);

  const splitCsv = (value) =>
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

  let codes = [];
  if (items.length === 0) {
    codes = [];
  } else if (items.length === 1 && items[0].includes(",")) {
    codes = splitCsv(items[0]);
  } else if (
    items.length > 1 &&
    items.every((item) => item === items[0]) &&
    items[0].includes(",")
  ) {
    // Same CSV repeated once per image — keep a single split list.
    codes = splitCsv(items[0]);
  } else {
    codes = items.flatMap((item) => (item.includes(",") ? splitCsv(item) : [item]));
  }

  const n = Math.max(imageCount, 0);
  if (n <= 0) return codes;
  return Array.from({ length: n }, (_, i) => codes[i] || `Color ${i + 1}`);
}

function buildColors(leaf) {
  const images = asArray(leaf.colorsImages);
  const codes = expandColorCodes(leaf.colorCodes, images.length);
  const n = Math.max(images.length, codes.length);
  const colors = [];
  const galleryVariants = [];
  for (let i = 0; i < n; i += 1) {
    const code = (codes[i] || `Color ${i + 1}`).toString();
    const imgUrl = toPublicUrl(images[i]) || "";
    const id = uuid();
    colors.push({ id, name: loc(code, code, code), hex: "#cccccc" });
    if (imgUrl) {
      galleryVariants.push({
        id: uuid(),
        name: loc(code, code, code),
        thumbUrl: imgUrl,
        imageUrl: imgUrl,
      });
    }
  }
  return { colors, galleryVariants };
}

function parsePrice(raw) {
  if (raw == null || raw === "") return 0;
  const n = Number(String(raw).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

async function clearCatalog(conn) {
  await conn.query("SET FOREIGN_KEY_CHECKS=0");
  const tables = [
    "product_variant_options",
    "product_variants",
    "product_option_values",
    "product_options",
    "product_collections",
    "products",
    "collections",
    "categories",
  ];
  for (const t of tables) {
    await conn.query(`DELETE FROM \`${t}\``);
  }
  await conn.query("SET FOREIGN_KEY_CHECKS=1");
}

async function main() {
  const newproducts = JSON.parse(
    fs.readFileSync(path.join(ROOT, "newproducts.json"), "utf8"),
  );
  const homeproducts = fs.existsSync(path.join(ROOT, "homeproducts.json"))
    ? JSON.parse(fs.readFileSync(path.join(ROOT, "homeproducts.json"), "utf8"))
    : [];

  const homeImageByEn = new Map();
  for (const h of homeproducts) {
    const key = (h.name_en || "").trim().toLowerCase();
    const url = toPublicUrl(h.image);
    if (key && url) homeImageByEn.set(key, url);
  }

  const conn = await mysql.createConnection(MYSQL);
  console.log("Connected to MySQL", MYSQL.database);
  console.log("Clearing existing catalog tables...");
  await clearCatalog(conn);

  const usedCatSlugs = new Set();
  const usedProductSlugs = new Set();
  const usedCollectionSlugs = new Set();
  const usedSkus = new Set();

  const parentByKey = new Map();
  const childByKey = new Map();
  const parentNeedsImage = new Set();

  let categoryCount = 0;
  let productCount = 0;
  let collectionCount = 0;
  let linkCount = 0;
  let skippedNoImages = 0;
  let emptySubPromoted = 0;

  const now = new Date();

  async function ensureParent(parentName, parentKey, seedImage) {
    let parent = parentByKey.get(parentKey);
    if (parent) return parent;
    const id = uuid();
    const slug = uniqueSlug(parentName.en || parentName.am, usedCatSlugs);
    const image =
      homeImageByEn.get(parentKey) ||
      seedImage ||
      parentCoverFallback(parentKey) ||
      null;
    await conn.query(
      `INSERT INTO categories (id, slug, name, description, image, parent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`,
      [
        id,
        slug,
        JSON.stringify(parentName),
        JSON.stringify(loc("", "", "")),
        image,
        now,
        now,
      ],
    );
    parent = { id, slug };
    parentByKey.set(parentKey, parent);
    if (!image) parentNeedsImage.add(id);
    categoryCount += 1;
    return parent;
  }

  async function ensureChild(parent, childName, image) {
    const label = (childName.en || childName.am || "").trim();
    if (!label) {
      throw new Error(`Refusing empty child category under ${parent.slug}`);
    }
    const childKey = `${parent.id}|${label.toLowerCase()}`;
    let child = childByKey.get(childKey);
    if (child) return child;
    const id = uuid();
    const slug = uniqueSlug(`${parent.slug}-${label}`, usedCatSlugs);
    await conn.query(
      `INSERT INTO categories (id, slug, name, description, image, parent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        slug,
        JSON.stringify(childName),
        JSON.stringify(loc("", "", "")),
        image || null,
        parent.id,
        now,
        now,
      ],
    );
    child = { id, slug };
    childByKey.set(childKey, child);
    categoryCount += 1;
    if (image && parentNeedsImage.has(parent.id)) {
      await conn.query(`UPDATE categories SET image = ? WHERE id = ? AND (image IS NULL OR image = '')`, [
        image,
        parent.id,
      ]);
      parentNeedsImage.delete(parent.id);
    }
    return child;
  }

  for (const doc of newproducts) {
    const parentName = loc(doc.productName_am, doc.productName_en, doc.productName_ru);
    const parentKey = parentName.en.toLowerCase() || parentName.am.toLowerCase();
    if (!parentKey) continue;

    let seedFiltered = null;
    for (const sub of asArray(doc.subCategory)) {
      seedFiltered = firstExistingUrl(sub.filteredImage);
      if (seedFiltered) break;
    }

    const parent = await ensureParent(parentName, parentKey, seedFiltered);

    for (const sub of asArray(doc.subCategory)) {
      const subName = loc(sub.subName_am, sub.subName_en, sub.subName_ru);
      const hasSubName = Boolean((subName.en || subName.am || "").trim());
      const filteredImage = firstExistingUrl(sub.filteredImage);

      for (const nested of asArray(sub.nestedCategories)) {
        const nestedName = loc(
          nested.nestedName_am,
          nested.nestedName_en,
          nested.nestedName_ru,
        );
        const hasNestedName = Boolean((nestedName.en || nestedName.am || "").trim());

        let category;
        let productName;
        if (hasSubName && hasNestedName) {
          // L2 = sub section, L3 = nested subcategory (needed for navbar columns)
          const l2 = await ensureChild(parent, subName, filteredImage);
          const leaf0 = asArray(nested.subNestedCategories)[0];
          const nestedCover =
            firstExistingUrl(leaf0?.generic_image) ||
            firstExistingUrl(leaf0?.images_am) ||
            filteredImage;
          category = await ensureChild(l2, nestedName, nestedCover);
          productName = nestedName;
        } else if (hasSubName) {
          category = await ensureChild(parent, subName, filteredImage);
          productName = subName;
        } else if (hasNestedName) {
          // Empty subName => nested entries are the visible subcategories
          emptySubPromoted += 1;
          const leaf0 = asArray(nested.subNestedCategories)[0];
          const nestedCover =
            firstExistingUrl(leaf0?.generic_image) ||
            firstExistingUrl(leaf0?.images_am) ||
            filteredImage;
          category = await ensureChild(parent, nestedName, nestedCover);
          productName = nestedName;
        } else {
          console.warn("Skip empty sub+nested under", parentName.en);
          continue;
        }

        for (const leaf of asArray(nested.subNestedCategories)) {
          const description = loc(
            leaf.description_am,
            leaf.description_en,
            leaf.description_ru,
          );
          const images = pickImages(leaf);
          if (!images.length) skippedNoImages += 1;

          const { colors, galleryVariants } = buildColors(leaf);
          const specs = [];
          if (leaf.montage_en || leaf.montage_am || leaf.montage_ru) {
            specs.push({
              key: "montage",
              label: loc("Մոնտաժ", "Installation", "Монтаж"),
              value: leaf.montage_en || leaf.montage_am || leaf.montage_ru || "",
            });
          }

          let skuBase = (leaf.code || "").toString().trim();
          if (!skuBase) {
            skuBase = `MIG-${slugify(productName.en || productName.am, "p").slice(0, 40)}`;
          }
          let sku = skuBase.slice(0, 70);
          let n = 2;
          while (usedSkus.has(sku)) {
            sku = `${skuBase.slice(0, 60)}-${n}`;
            n += 1;
          }
          usedSkus.add(sku);

          const productId = uuid();
          const productSlug = uniqueSlug(
            productName.en || productName.am || sku,
            usedProductSlugs,
          );
          const price = parsePrice(leaf.price);
          const availability = String(leaf.status || "")
            .toLowerCase()
            .includes("out")
            ? "limited"
            : "in_stock";

          let collectionId = null;
          const accImages = pickAccessoryImages(leaf);
          if (accImages.length) {
            collectionId = uuid();
            const colName = loc(
              `${productName.am} - աքսեսուարներ`,
              `${productName.en} - accessories`,
              `${productName.ru} - аксессуары`,
            );
            const colSlug = uniqueSlug(`acc-${productSlug}`, usedCollectionSlugs);
            const emptyLoc = loc("", "", "");
            await conn.query(
              `INSERT INTO collections
                (id, slug, sku, name, description, image, style, images, gallery_variants, model_url, video_url,
                 height, width, depth, length, material, finish, colors, textures, specs, downloads,
                 price, featured, availability, created_at, updated_at)
               VALUES (?, ?, NULL, ?, ?, ?, NULL, ?, ?, NULL, NULL, 0, 0, 0, 0, NULL, NULL, ?, ?, ?, ?, 0, 0, 'in_stock', ?, ?)`,
              [
                collectionId,
                colSlug,
                JSON.stringify(colName),
                JSON.stringify(emptyLoc),
                accImages[0],
                JSON.stringify(accImages),
                JSON.stringify([]),
                JSON.stringify([]),
                JSON.stringify([]),
                JSON.stringify([]),
                JSON.stringify([]),
                now,
                now,
              ],
            );
            collectionCount += 1;
          }

          await conn.query(
            `INSERT INTO products
              (id, slug, sku, name, description, category_id, collection_id, images, model_url, video_url,
               height, width, depth, length, material, finish, colors, gallery_variants, textures, specs, downloads,
               price, featured, availability, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 0, 0, 0, 0, NULL, NULL, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
            [
              productId,
              productSlug,
              sku,
              JSON.stringify(productName),
              JSON.stringify(description),
              category.id,
              collectionId,
              JSON.stringify(images),
              JSON.stringify(colors),
              JSON.stringify(galleryVariants),
              JSON.stringify([]),
              JSON.stringify(specs),
              JSON.stringify([]),
              price,
              availability,
              now,
              now,
            ],
          );
          productCount += 1;

          if (collectionId) {
            await conn.query(
              `INSERT INTO product_collections (product_id, collection_id, created_at) VALUES (?, ?, ?)`,
              [productId, collectionId, now],
            );
            linkCount += 1;
          }
        }
      }
    }
  }

  // Final parent cover fallbacks
  for (const [parentKey, parent] of parentByKey.entries()) {
    const fallback = parentCoverFallback(parentKey);
    if (!fallback) continue;
    await conn.query(
      `UPDATE categories SET image = ? WHERE id = ? AND (image IS NULL OR image = '')`,
      [fallback, parent.id],
    );
  }

  await conn.end();
  console.log(
    JSON.stringify(
      {
        ok: true,
        categories: categoryCount,
        products: productCount,
        collections: collectionCount,
        productCollectionLinks: linkCount,
        skippedNoImages,
        emptySubPromoted,
        parents: parentByKey.size,
        children: childByKey.size,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("MIGRATION FAILED", err);
  process.exit(1);
});

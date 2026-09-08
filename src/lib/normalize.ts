import { jsonArray, mediaList } from "@/lib/utils";
import type {
  Author,
  BlogPost,
  Collection,
  Product,
  ProductColor,
  ProductDownload,
  ProductGalleryVariant,
  ProductSpec,
  ProductTexture,
  Project,
} from "@/types";

function normalizeGalleryVariant(
  variant: ProductGalleryVariant & { thumbUrl?: string },
): ProductGalleryVariant {
  const imageUrl = (variant.imageUrl ?? "").trim();
  const thumbUrl = (variant.thumbUrl ?? "").trim() || imageUrl;
  return {
    id: variant.id,
    name: variant.name,
    thumbUrl,
    imageUrl,
  };
}

function legacyGalleryFromColors(colors: ProductColor[]): ProductGalleryVariant[] {
  return jsonArray<ProductColor & { imageUrl?: string }>(colors)
    .filter((color) => color.imageUrl?.trim())
    .map((color) =>
      normalizeGalleryVariant({
        id: color.id,
        name: color.name,
        thumbUrl: color.imageUrl!.trim(),
        imageUrl: color.imageUrl!.trim(),
      }),
    );
}

function legacyGalleryFromImages(images: string[]): ProductGalleryVariant[] {
  return images
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, index) =>
      normalizeGalleryVariant({
        id: `legacy-img-${index}`,
        name: { am: "", ru: "", en: "" },
        thumbUrl: url,
        imageUrl: url,
      }),
    );
}

function resolveGallery(
  images: string[],
  colors: ProductColor[],
  galleryVariants: ProductGalleryVariant[],
) {
  const resolvedGallery =
    galleryVariants.length > 0
      ? galleryVariants
      : legacyGalleryFromColors(colors).length > 0
        ? legacyGalleryFromColors(colors)
        : legacyGalleryFromImages(images);

  const validGallery = resolvedGallery.filter((variant) => variant.imageUrl || variant.thumbUrl);
  return {
    images: validGallery.length > 0 ? validGallery.map((v) => v.imageUrl || v.thumbUrl) : images,
    galleryVariants: validGallery,
  };
}

export function normalizeProduct(product: Product): Product {
  const colors = jsonArray<ProductColor>(product.colors);
  const images = mediaList(product.images);
  const galleryVariants = jsonArray<ProductGalleryVariant>(product.galleryVariants).map(
    normalizeGalleryVariant,
  );
  const gallery = resolveGallery(images, colors, galleryVariants);
  const raw = product as Product & { collection_ids?: string[] };
  const collectionIds =
    jsonArray<string>(product.collectionIds ?? raw.collection_ids).length > 0
      ? jsonArray<string>(product.collectionIds ?? raw.collection_ids)
      : product.collectionId
        ? [product.collectionId]
        : [];

  return {
    ...product,
    ...gallery,
    colors,
    textures: jsonArray<ProductTexture>(product.textures),
    specs: jsonArray<ProductSpec>(product.specs),
    downloads: jsonArray<ProductDownload>(product.downloads),
    collectionIds,
  };
}

export function normalizeCollection(collection: Collection): Collection {
  const colors = jsonArray<ProductColor>(collection.colors);
  const images = mediaList(collection.images?.length ? collection.images : collection.image ? [collection.image] : []);
  const galleryVariants = jsonArray<ProductGalleryVariant>(collection.galleryVariants).map(
    normalizeGalleryVariant,
  );
  const gallery = resolveGallery(images, colors, galleryVariants);
  const raw = collection as Collection & { product_count?: number };

  return {
    ...collection,
    ...gallery,
    image: collection.image || gallery.images[0] || "",
    colors,
    textures: jsonArray<ProductTexture>(collection.textures),
    specs: jsonArray<ProductSpec>(collection.specs),
    downloads: jsonArray<ProductDownload>(collection.downloads),
    productCount: collection.productCount ?? raw.product_count ?? 0,
    height: Number(collection.height) || 0,
    width: Number(collection.width) || 0,
    depth: Number(collection.depth) || 0,
    length: Number(collection.length) || 0,
    price: Number(collection.price) || 0,
    material: collection.material ?? "",
    finish: collection.finish ?? "",
    style: collection.style ?? "modern",
  };
}

export function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct);
}

export function normalizeCollections(collections: Collection[]): Collection[] {
  return collections.map(normalizeCollection);
}

export function normalizeProject(project: Project): Project {
  return {
    ...project,
    images: mediaList(project.images),
    products: jsonArray<string>(project.products),
  };
}

const emptyAuthor: Author = {
  id: "",
  name: "",
  avatar: "",
  role: { en: "", ru: "", am: "" },
};

function normalizeAuthor(value: unknown): Author {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const author = value as Partial<Author>;
    return {
      id: author.id ?? "",
      name: author.name ?? "",
      avatar: author.avatar ?? "",
      role: author.role ?? emptyAuthor.role,
    };
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return emptyAuthor;
    try {
      return normalizeAuthor(JSON.parse(trimmed));
    } catch {
      return { ...emptyAuthor, name: trimmed };
    }
  }
  return emptyAuthor;
}

export function normalizePost(post: BlogPost): BlogPost {
  return {
    ...post,
    tags: jsonArray<string>(post.tags),
    author: normalizeAuthor(post.author),
  };
}

export function normalizePosts(posts: BlogPost[]): BlogPost[] {
  return posts.map(normalizePost);
}

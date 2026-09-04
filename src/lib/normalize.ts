import { jsonArray, mediaList } from "@/lib/utils";
import type { Author, BlogPost, Product, ProductColor, ProductDownload, ProductGalleryVariant, ProductSpec, ProductTexture, Project } from "@/types";

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

export function normalizeProduct(product: Product): Product {
  const colors = jsonArray<ProductColor>(product.colors);
  const images = mediaList(product.images);
  const galleryVariants = jsonArray<ProductGalleryVariant>(product.galleryVariants).map(
    normalizeGalleryVariant,
  );
  const resolvedGallery =
    galleryVariants.length > 0
      ? galleryVariants
      : legacyGalleryFromColors(colors).length > 0
        ? legacyGalleryFromColors(colors)
        : legacyGalleryFromImages(images);

  const validGallery = resolvedGallery.filter((variant) => variant.imageUrl || variant.thumbUrl);

  return {
    ...product,
    images: validGallery.length > 0 ? validGallery.map((v) => v.imageUrl || v.thumbUrl) : images,
    colors,
    galleryVariants: validGallery,
    textures: jsonArray<ProductTexture>(product.textures),
    specs: jsonArray<ProductSpec>(product.specs),
    downloads: jsonArray<ProductDownload>(product.downloads),
  };
}

export function normalizeProducts(products: Product[]): Product[] {
  return products.map(normalizeProduct);
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

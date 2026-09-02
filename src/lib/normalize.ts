import { jsonArray, mediaList } from "@/lib/utils";
import type { Product, ProductColor, ProductDownload, ProductGalleryVariant, ProductSpec, ProductTexture, Project } from "@/types";

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

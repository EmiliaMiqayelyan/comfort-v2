import { jsonArray, mediaList } from "@/lib/utils";
import type { Product, ProductColor, ProductDownload, ProductGalleryVariant, ProductSpec, ProductTexture, Project } from "@/types";

function legacyGalleryFromColors(colors: ProductColor[]): ProductGalleryVariant[] {
  return jsonArray<ProductColor & { imageUrl?: string }>(colors)
    .filter((color) => color.imageUrl?.trim())
    .map((color) => ({
      id: color.id,
      name: color.name,
      imageUrl: color.imageUrl!.trim(),
    }));
}

export function normalizeProduct(product: Product): Product {
  const colors = jsonArray<ProductColor>(product.colors);
  const galleryVariants = jsonArray<ProductGalleryVariant>(product.galleryVariants);
  const resolvedGallery =
    galleryVariants.length > 0 ? galleryVariants : legacyGalleryFromColors(colors);

  return {
    ...product,
    images: mediaList(product.images),
    colors,
    galleryVariants: resolvedGallery,
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

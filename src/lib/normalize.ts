import { jsonArray, mediaList } from "@/lib/utils";
import type { Product, ProductColor, ProductDownload, ProductSpec, ProductTexture, Project } from "@/types";

export function normalizeProduct(product: Product): Product {
  return {
    ...product,
    images: mediaList(product.images),
    colors: jsonArray<ProductColor>(product.colors),
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

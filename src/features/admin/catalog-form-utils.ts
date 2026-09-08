import type {
  LocalizedString,
  Product,
  ProductColor,
  ProductDownload,
  ProductGalleryVariant,
  ProductSpec,
  ProductTexture,
  Collection,
} from "@/types";
import { emptyLocalized, asLocalized } from "@/features/admin/form-ui";

export function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const emptyColor = (): ProductColor => ({
  id: uid("color"),
  name: emptyLocalized(),
  hex: "#F7F7F4",
});

export const emptyGalleryVariant = (): ProductGalleryVariant => ({
  id: uid("gv"),
  name: emptyLocalized(),
  thumbUrl: "",
  imageUrl: "",
});

export const emptyTexture = (): ProductTexture => ({
  id: uid("texture"),
  name: emptyLocalized(),
  mapUrl: "",
  previewUrl: "",
});

export const emptySpec = (): ProductSpec => ({
  key: uid("spec"),
  label: emptyLocalized(),
  value: "",
  unit: "mm",
});

export const emptyDownload = (): ProductDownload => ({
  id: uid("dl"),
  type: "pdf",
  label: emptyLocalized(),
  url: "",
  size: "",
});

export function formatBytes(size?: number) {
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      return [trimmed] as T[];
    }
  }
  return fallback;
}

type CatalogFormFields = Omit<Product, "id" | "categoryId" | "collectionId" | "collectionIds">;

function buildGalleryVariants(
  item?: Partial<Pick<Product | Collection, "galleryVariants" | "colors" | "images">>,
) {
  const images = asArray<string>(item?.images);
  const storedGallery = asArray<ProductGalleryVariant>(item?.galleryVariants);
  const legacyFromColors = asArray<ProductColor & { imageUrl?: string }>(item?.colors)
    .filter((color) => color.imageUrl?.trim())
    .map((color) => ({
      id: color.id || uid("gv"),
      name: asLocalized(color.name),
      thumbUrl: color.imageUrl!.trim(),
      imageUrl: color.imageUrl!.trim(),
    }));
  const legacyFromImages = images
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => ({
      id: uid("gv"),
      name: emptyLocalized(),
      thumbUrl: url,
      imageUrl: url,
    }));
  const seedGallery =
    storedGallery.length > 0
      ? storedGallery
      : legacyFromColors.length > 0
        ? legacyFromColors
        : legacyFromImages;

  return (seedGallery.length > 0 ? seedGallery : [emptyGalleryVariant()]).map((variant) => {
    const imageUrl = variant.imageUrl ?? "";
    const thumbUrl = variant.thumbUrl?.trim() || imageUrl;
    return {
      ...variant,
      id: variant.id || uid("gv"),
      name: asLocalized(variant.name),
      thumbUrl,
      imageUrl,
    };
  });
}

export function toCatalogFormFields(
  item?: Partial<Product | Collection>,
  defaults?: Partial<CatalogFormFields>,
): CatalogFormFields {
  const galleryVariants = buildGalleryVariants(item);
  const colors = asArray<ProductColor>(item?.colors).map((color) => ({
    ...color,
    id: color.id || uid("color"),
    name: asLocalized(color.name),
    hex: color.hex || "#F7F7F4",
  }));
  const textures = asArray<ProductTexture>(item?.textures).map((texture) => ({
    ...texture,
    id: texture.id || uid("texture"),
    name: asLocalized(texture.name),
    mapUrl: texture.mapUrl ?? "",
    previewUrl: texture.previewUrl ?? "",
  }));
  const specs = asArray<ProductSpec>(item?.specs).map((spec) => ({
    ...spec,
    key: spec.key || uid("spec"),
    label: asLocalized(spec.label),
    value: spec.value ?? "",
    unit: spec.unit ?? "mm",
  }));
  const downloads = asArray<ProductDownload>(item?.downloads).map((file) => ({
    ...file,
    id: file.id || uid("dl"),
    type: file.type || "pdf",
    label: asLocalized(file.label),
    url: file.url ?? "",
    size: file.size ?? "",
  }));

  return {
    slug: item?.slug ?? "",
    sku: item?.sku ?? "",
    name: asLocalized(item?.name),
    description: asLocalized(item?.description),
    images: galleryVariants.map((variant) => variant.imageUrl).filter(Boolean),
    modelUrl: item?.modelUrl ?? "",
    videoUrl: item?.videoUrl ?? "",
    height: item?.height ?? defaults?.height ?? 80,
    width: item?.width ?? defaults?.width ?? 16,
    depth: item?.depth ?? defaults?.depth ?? 16,
    length: item?.length ?? defaults?.length ?? 2400,
    material: item?.material ?? defaults?.material ?? "HD polymer",
    finish: item?.finish ?? defaults?.finish ?? "Matte",
    colors: colors.length ? colors : [emptyColor()],
    galleryVariants,
    textures: textures.length ? textures : [emptyTexture()],
    specs: specs.length ? specs : [emptySpec()],
    downloads,
    price: item?.price ?? 0,
    featured: item?.featured ?? false,
    availability: item?.availability ?? "in_stock",
  };
}

export function buildCatalogPayload<T extends CatalogFormFields>(form: T) {
  const name = asLocalized(form.name);
  const slug = (form.slug ?? "").trim();
  const sku = (form.sku ?? "").trim();
  const galleryVariants = asArray<ProductGalleryVariant>(form.galleryVariants)
    .map((variant) => {
      const imageUrl = variant.imageUrl?.trim() || "";
      const thumbUrl = variant.thumbUrl?.trim() || "";
      return {
        ...variant,
        name: asLocalized(variant.name),
        thumbUrl,
        imageUrl,
      };
    })
    .filter((variant) => variant.imageUrl && variant.thumbUrl);

  return {
    name,
    description: asLocalized(form.description),
    slug,
    sku,
    images: galleryVariants.map((variant) => variant.imageUrl),
    image: galleryVariants[0]?.imageUrl || undefined,
    modelUrl: form.modelUrl?.trim() || undefined,
    videoUrl: form.videoUrl?.trim() || undefined,
    colors: asArray<ProductColor>(form.colors)
      .map((color) => ({
        ...color,
        name: asLocalized(color.name),
      }))
      .filter((color) => color.name.en.trim() || color.hex),
    galleryVariants,
    textures: asArray<ProductTexture>(form.textures)
      .map((texture) => ({ ...texture, name: asLocalized(texture.name) }))
      .filter((texture) => texture.name.en.trim()),
    specs: asArray<ProductSpec>(form.specs)
      .map((spec) => ({ ...spec, label: asLocalized(spec.label) }))
      .filter((spec) => spec.label.en.trim() || (spec.value ?? "").trim()),
    downloads: asArray<ProductDownload>(form.downloads)
      .map((file) => ({ ...file, label: asLocalized(file.label) }))
      .filter((file) => (file.url ?? "").trim() || file.label.en.trim()),
    height: form.height,
    width: form.width,
    depth: form.depth,
    length: form.length,
    material: form.material,
    finish: form.finish,
    price: form.price,
    featured: form.featured,
    availability: form.availability,
  };
}

import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

const optionValueDto = z.object({
  id: z.string().min(1).optional(),
  label: localizedSchema,
  value: z.string().min(1),
  hex: z.string().nullable().optional(),
  swatchUrl: z.string().nullable().optional(),
  sortOrder: z.coerce.number().optional(),
});

const optionDto = z.object({
  id: z.string().min(1).optional(),
  key: z.string().min(1),
  label: localizedSchema,
  uiType: z.enum(['buttons', 'swatches']).default('buttons'),
  sortOrder: z.coerce.number().optional(),
  values: z.array(optionValueDto).default([]),
});

const variantDto = z.object({
  id: z.string().min(1).optional(),
  sku: z.string().min(1),
  optionValueIds: z.array(z.string().min(1)).default([]),
  imageUrl: z.string().nullable().optional(),
  thumbUrl: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  textureMapUrl: z.string().nullable().optional(),
  texturePreviewUrl: z.string().nullable().optional(),
  price: z.coerce.number().nullable().optional(),
  availability: z.enum(['in_stock', 'limited', 'preorder']).nullable().optional(),
  height: z.coerce.number().nullable().optional(),
  width: z.coerce.number().nullable().optional(),
  depth: z.coerce.number().nullable().optional(),
  length: z.coerce.number().nullable().optional(),
  isDefault: z.union([z.boolean(), z.coerce.number()]).optional(),
  sortOrder: z.coerce.number().optional(),
});

export const createProductDto = z.object({
  slug: z.string().min(1),
  sku: z.string().min(1),
  name: localizedSchema,
  description: localizedSchema.optional(),
  categoryId: z.string().min(1),
  collectionId: z.string().nullable().optional(),
  collectionIds: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  modelUrl: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  height: z.coerce.number().default(0),
  width: z.coerce.number().default(0),
  depth: z.coerce.number().default(0),
  length: z.coerce.number().default(0),
  material: z.string().nullable().optional(),
  finish: z.string().nullable().optional(),
  colors: z.array(z.unknown()).optional(),
  galleryVariants: z.array(z.unknown()).optional(),
  textures: z.array(z.unknown()).optional(),
  specs: z.array(z.unknown()).optional(),
  downloads: z.array(z.unknown()).optional(),
  price: z.coerce.number().default(0),
  featured: z.union([z.boolean(), z.coerce.number()]).optional(),
  availability: z.enum(['in_stock', 'limited', 'preorder']).default('in_stock'),
  options: z.array(optionDto).optional(),
  variants: z.array(variantDto).optional(),
});

export const updateProductDto = createProductDto.partial();

export type ProductOptionInput = z.infer<typeof optionDto>;
export type ProductVariantInput = z.infer<typeof variantDto>;

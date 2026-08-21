import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createProductDto = z.object({
  slug: z.string().min(1),
  sku: z.string().min(1),
  name: localizedSchema,
  description: localizedSchema.optional(),
  categoryId: z.string().min(1),
  collectionId: z.string().nullable().optional(),
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
  textures: z.array(z.unknown()).optional(),
  specs: z.array(z.unknown()).optional(),
  downloads: z.array(z.unknown()).optional(),
  price: z.coerce.number().default(0),
  featured: z.union([z.boolean(), z.coerce.number()]).optional(),
  availability: z.enum(['in_stock', 'limited', 'preorder']).default('in_stock'),
});

export const updateProductDto = createProductDto.partial();

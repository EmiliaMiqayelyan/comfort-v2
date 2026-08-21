import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createCategoryDto = z.object({
  slug: z.string().min(1),
  name: localizedSchema,
  description: localizedSchema.optional(),
  image: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export const updateCategoryDto = createCategoryDto.partial();

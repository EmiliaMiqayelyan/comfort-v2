import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createProjectDto = z.object({
  slug: z.string().min(1),
  title: localizedSchema,
  description: localizedSchema.optional(),
  location: localizedSchema.optional(),
  year: z.coerce.number().nullable().optional(),
  images: z.array(z.string()).optional(),
  beforeImage: z.string().nullable().optional(),
  afterImage: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  productIds: z.array(z.string()).optional(),
  category: z.string().nullable().optional(),
});

export const updateProjectDto = createProjectDto.partial();

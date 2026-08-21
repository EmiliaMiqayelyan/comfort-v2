import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createCollectionDto = z.object({
  slug: z.string().min(1),
  name: localizedSchema,
  description: localizedSchema.optional(),
  image: z.string().nullable().optional(),
  style: z.string().nullable().optional(),
});

export const updateCollectionDto = createCollectionDto.partial();

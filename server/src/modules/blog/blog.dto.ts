import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createBlogDto = z.object({
  slug: z.string().min(1),
  title: localizedSchema,
  excerpt: localizedSchema.optional(),
  content: localizedSchema.optional(),
  coverImage: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  author: z.record(z.unknown()).nullable().optional(),
  publishedAt: z.string().nullable().optional(),
});

export const updateBlogDto = createBlogDto.partial();

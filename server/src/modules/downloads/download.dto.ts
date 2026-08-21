import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createDownloadDto = z.object({
  filename: z.string().min(1),
  title: localizedSchema,
  category: z.string().nullable().optional(),
  url: z.string().min(1),
  fileSize: z.string().nullable().optional(),
  downloadable: z.union([z.boolean(), z.coerce.number()]).default(true),
});

export const updateDownloadDto = createDownloadDto.partial();

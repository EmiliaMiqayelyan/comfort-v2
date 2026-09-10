import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createPartnerDto = z.object({
  title: localizedSchema,
  logo: z.string().min(1),
  websiteUrl: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const updatePartnerDto = createPartnerDto.partial();

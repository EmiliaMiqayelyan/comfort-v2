import { z } from 'zod';
import { localizedSchema } from '../../shared/utils/localized';

export const createCertificateDto = z.object({
  title: localizedSchema,
  issuer: z.string().nullable().optional(),
  year: z.coerce.number().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export const updateCertificateDto = createCertificateDto.partial();

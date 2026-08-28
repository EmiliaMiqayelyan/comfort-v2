import { z } from 'zod';

export const updateContactSettingsDto = z.record(z.unknown());

export const updateHeroSettingsDto = z
  .object({
    images: z.array(z.string()).optional(),
    image: z.string().optional(),
  })
  .refine(
    (value) =>
      (Array.isArray(value.images) && value.images.some((item) => item.trim())) ||
      Boolean(value.image?.trim()),
    { message: 'At least one hero image is required' },
  );

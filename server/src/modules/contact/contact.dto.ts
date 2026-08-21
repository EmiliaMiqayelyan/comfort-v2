import { z } from 'zod';

export const createContactDto = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  message: z.string().min(1),
});

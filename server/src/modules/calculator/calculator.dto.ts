import { z } from 'zod';

export const createCalculatorDto = z.object({
  userEmail: z.string().email().nullable().optional(),
  inputJson: z.record(z.unknown()),
  resultJson: z.record(z.unknown()),
});

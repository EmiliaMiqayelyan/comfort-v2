import { z } from 'zod';

export const localizedSchema = z.object({
  en: z.string().default(''),
  ru: z.string().default(''),
  am: z.string().default(''),
});

export type Localized = z.infer<typeof localizedSchema>;

export function fillLocalized(data: Partial<Localized>): Localized {
  const en = data.en ?? '';
  return {
    en,
    ru: data.ru || en,
    am: data.am || en,
  };
}

export const locales = ["am", "ru", "en"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";

export const localeNames: Record<AppLocale, string> = {
  am: "Հայ",
  ru: "RU",
  en: "EN",
};

export const localeLabels: Record<AppLocale, string> = {
  am: "Հայերեն",
  ru: "Русский",
  en: "English",
};

import type { LocalizedString } from "@/types";

const PRODUCT_RENDER = "/products/plinth.jpg";

const img = {
  product: PRODUCT_RENDER,
  hero1:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80",
  hero2:
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=80",
  hero3:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=80",
  living:
    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1600&q=80",
  factory:
    "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
  catalog:
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=80",
  white:
    "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1000&q=80",
  wood:
    "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1000&q=80",
};

const L = (en: string, ru: string, am: string): LocalizedString => ({ en, ru, am });

export const heroSlides = [
  { id: 1, image: img.hero1, videoPoster: img.hero1 },
  { id: 2, image: img.hero2, videoPoster: img.hero2 },
  { id: 3, image: img.hero3, videoPoster: img.hero3 },
];

export const roomPresets = [
  { id: "living-warm", name: L("Warm Living", "Тёплая гостиная", "Ջերմ հյուրասենյակ"), image: img.living },
  { id: "gallery-white", name: L("White Gallery", "Белая галерея", "Սպիտակ պատկերասրահ"), image: img.white },
  { id: "wood-suite", name: L("Wood Suite", "Деревянный suite", "Փայտե suite"), image: img.wood },
];

export const siteImages = img;

export function getLocalized(
  value: LocalizedString | string | null | undefined,
  locale: string,
): string {
  const localized = coerceLocalized(value);
  if (!localized) return "";
  const key = locale as keyof LocalizedString;
  return localized[key] || localized.en || localized.ru || localized.am || "";
}

function coerceLocalized(
  value: LocalizedString | string | null | undefined,
): LocalizedString | null {
  if (value == null || value === "") return null;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return coerceLocalized(parsed as LocalizedString);
      }
      return { en: value, ru: value, am: value };
    } catch {
      return { en: value, ru: value, am: value };
    }
  }
  if (typeof value !== "object") return null;
  return {
    en: value.en ?? "",
    ru: value.ru ?? "",
    am: value.am ?? "",
  };
}

import type { LocalizedString } from "@/types";

export function emptyLocalized(): LocalizedString {
  return { en: "", ru: "", am: "" };
}

/** Normalize API localized fields (object, JSON string, or partial). */
export function asLocalized(value: unknown): LocalizedString {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    return {
      en: typeof record.en === "string" ? record.en : "",
      ru: typeof record.ru === "string" ? record.ru : "",
      am: typeof record.am === "string" ? record.am : "",
    };
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return emptyLocalized();
    try {
      return asLocalized(JSON.parse(trimmed) as unknown);
    } catch {
      return { en: trimmed, ru: trimmed, am: trimmed };
    }
  }
  return emptyLocalized();
}

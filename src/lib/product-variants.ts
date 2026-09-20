import type { LocalizedString, ProductOption, ProductVariant } from "@/types";

/** Resolve a variant whose optionValueIds cover every selected value. */
export function findVariantBySelection(
  variants: ProductVariant[],
  selectedValueIds: string[],
): ProductVariant | null {
  if (variants.length === 0) return null;
  if (selectedValueIds.length === 0) {
    return variants.find((variant) => variant.isDefault) ?? variants[0] ?? null;
  }
  const selected = new Set(selectedValueIds);
  return (
    variants.find((variant) =>
      selectedValueIds.every((id) => variant.optionValueIds.includes(id)),
    ) ??
    variants.find((variant) =>
      variant.optionValueIds.every((id) => selected.has(id)) &&
      variant.optionValueIds.length === selected.size,
    ) ??
    null
  );
}

/** Whether choosing `valueId` for this option stays compatible with other selections. */
export function isOptionValueAvailable(
  variants: ProductVariant[],
  options: ProductOption[],
  optionId: string,
  valueId: string,
  selectedByOptionId: Record<string, string>,
): boolean {
  const nextSelection = { ...selectedByOptionId, [optionId]: valueId };
  const selectedIds = options
    .map((option) => nextSelection[option.id])
    .filter(Boolean);
  return variants.some((variant) =>
    selectedIds.every((id) => variant.optionValueIds.includes(id)),
  );
}

/** Build cartesian product of option value ids (one per axis). */
export function cartesianOptionCombos(
  options: ProductOption[],
): string[][] {
  if (options.length === 0) return [];
  return options.reduce<string[][]>(
    (acc, option) => {
      const valueIds = option.values.map((value) => value.id).filter(Boolean);
      if (valueIds.length === 0) return acc;
      if (acc.length === 0) return valueIds.map((id) => [id]);
      return acc.flatMap((combo) => valueIds.map((id) => [...combo, id]));
    },
    [],
  );
}

export function comboKey(optionValueIds: string[]): string {
  return [...optionValueIds].sort().join("|");
}

export function defaultVariantSelection(
  options: ProductOption[],
  variants: ProductVariant[],
  preferredVariantId?: string | null,
): { variant: ProductVariant | null; selectedByOptionId: Record<string, string> } {
  const preferred =
    (preferredVariantId
      ? variants.find((variant) => variant.id === preferredVariantId)
      : null) ??
    variants.find((variant) => variant.isDefault) ??
    variants[0] ??
    null;

  const selectedByOptionId: Record<string, string> = {};
  if (preferred) {
    for (const option of options) {
      const match = option.values.find((value) =>
        preferred.optionValueIds.includes(value.id),
      );
      if (match) selectedByOptionId[option.id] = match.id;
    }
  } else {
    for (const option of options) {
      if (option.values[0]) selectedByOptionId[option.id] = option.values[0].id;
    }
  }

  const selectedIds = options
    .map((option) => selectedByOptionId[option.id])
    .filter(Boolean);
  const variant = findVariantBySelection(variants, selectedIds) ?? preferred;

  return { variant, selectedByOptionId };
}

export function optionValueLabel(
  options: ProductOption[],
  valueId: string,
  locale: string,
  getLocalized: (value: LocalizedString, locale: string) => string,
): string {
  for (const option of options) {
    const value = option.values.find((entry) => entry.id === valueId);
    if (value) return getLocalized(value.label, locale);
  }
  return "";
}

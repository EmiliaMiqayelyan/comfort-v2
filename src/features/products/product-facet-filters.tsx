"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalized } from "@/data/catalog";
import { cn, jsonArray } from "@/lib/utils";
import type { Product, ProductOption, ProductVariant } from "@/types";

type FacetOption = {
  key: string;
  label: string;
  values: Array<{ value: string; label: string }>;
};

export function collectFacets(products: Product[], locale: string): FacetOption[] {
  const byKey = new Map<
    string,
    { label: string; values: Map<string, string> }
  >();

  for (const product of products) {
    const options = jsonArray<ProductOption>(product.options);
    for (const option of options) {
      if (!option.key) continue;
      const existing = byKey.get(option.key) ?? {
        label: getLocalized(option.label, locale).trim() || option.key,
        values: new Map<string, string>(),
      };
      if (!existing.label) {
        existing.label = getLocalized(option.label, locale).trim() || option.key;
      }
      for (const value of option.values) {
        if (!value.value) continue;
        if (!existing.values.has(value.value)) {
          existing.values.set(
            value.value,
            getLocalized(value.label, locale).trim() || value.value,
          );
        }
      }
      byKey.set(option.key, existing);
    }
  }

  return [...byKey.entries()]
    .map(([key, entry]) => ({
      key,
      label: entry.label,
      values: [...entry.values.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, locale)),
    }))
    .filter((facet) => facet.values.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

function productMatchesFacets(
  product: Product,
  selected: Record<string, string>,
): boolean {
  const entries = Object.entries(selected).filter(([, value]) => Boolean(value));
  if (entries.length === 0) return true;

  const options = jsonArray<ProductOption>(product.options);
  const variants = jsonArray<ProductVariant>(product.variants);
  if (variants.length === 0) return false;

  const valueIdsByKey = new Map<string, Set<string>>();
  for (const option of options) {
    valueIdsByKey.set(
      option.key,
      new Set(
        option.values
          .filter((value) =>
            entries.some(
              ([key, selectedValue]) =>
                key === option.key && value.value === selectedValue,
            ),
          )
          .map((value) => value.id),
      ),
    );
  }

  return variants.some((variant) =>
    entries.every(([key]) => {
      const ids = valueIdsByKey.get(key);
      if (!ids || ids.size === 0) return false;
      return [...ids].some((id) => variant.optionValueIds.includes(id));
    }),
  );
}

export function useProductFacetFilter(products: Product[]) {
  const locale = useLocale();
  const [selected, setSelected] = useState<Record<string, string>>({});
  const facets = useMemo(
    () => collectFacets(products, locale),
    [products, locale],
  );
  const filtered = useMemo(
    () => products.filter((product) => productMatchesFacets(product, selected)),
    [products, selected],
  );

  const setFacet = (key: string, value: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (!value || next[key] === value) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const clearFacets = () => setSelected({});

  return { facets, selected, filtered, setFacet, clearFacets };
}

export function ProductFacetFilters({
  facets,
  selected,
  onSelect,
  onClear,
}: {
  facets: FacetOption[];
  selected: Record<string, string>;
  onSelect: (key: string, value: string) => void;
  onClear: () => void;
}) {
  const t = useTranslations("categories");
  const locale = useLocale();
  if (facets.length === 0) return null;

  const clearLabel = t.has("clearFilters")
    ? t("clearFilters")
    : locale === "am"
      ? "Մաքրել"
      : locale === "ru"
        ? "Сбросить"
        : "Clear";
  const filtersLabel = t.has("filters")
    ? t("filters")
    : locale === "am"
      ? "Ֆիլտրեր"
      : locale === "ru"
        ? "Фильтры"
        : "Filters";

  const hasSelection = Object.keys(selected).length > 0;

  return (
    <div className="mb-6 space-y-4 rounded-[5px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">{filtersLabel}</p>
        {hasSelection ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-accent underline underline-offset-4"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
      {facets.map((facet) => (
        <div key={facet.key}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {facet.label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {facet.values.map((entry) => {
              const isSelected = selected[facet.key] === entry.value;
              return (
                <button
                  key={entry.value}
                  type="button"
                  onClick={() => onSelect(facet.key, entry.value)}
                  className={cn(
                    "rounded-[3px] border px-2.5 py-1.5 text-xs transition",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:border-foreground/40",
                  )}
                  aria-pressed={isSelected}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

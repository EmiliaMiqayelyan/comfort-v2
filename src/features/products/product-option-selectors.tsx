"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { getLocalized } from "@/data/catalog";
import { isOptionValueAvailable } from "@/lib/product-variants";
import { cn, mediaSrc } from "@/lib/utils";
import type { ProductOption, ProductVariant } from "@/types";

export function ProductOptionSelectors({
  options,
  variants,
  selectedByOptionId,
  onSelect,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
  selectedByOptionId: Record<string, string>;
  onSelect: (optionId: string, valueId: string) => void;
}) {
  const locale = useLocale();

  if (options.length === 0) return null;

  const swatchOptions = options.filter((option) => option.uiType === "swatches");
  const buttonOptions = options.filter((option) => option.uiType !== "swatches");
  const groups = [swatchOptions, buttonOptions].filter((group) => group.length > 0);

  return (
    <div className="space-y-4">
      {groups.map((group, groupIndex) => (
        <div
          key={groupIndex === 0 ? "swatches" : "buttons"}
          className={cn(groupIndex > 0 && "border-t border-border/70 pt-4")}
        >
          <div className="space-y-5">
            {group.map((option) => {
              const selectedValueId = selectedByOptionId[option.id];
              const selectedValue = option.values.find(
                (value) => value.id === selectedValueId,
              );
              const optionLabel =
                getLocalized(option.label, locale).trim() || option.key;
              const selectedLabel = selectedValue
                ? getLocalized(selectedValue.label, locale).trim() ||
                  selectedValue.value
                : "";
              const heading = selectedLabel
                ? `${optionLabel}: ${selectedLabel}`
                : optionLabel;

              return (
                <div key={option.id}>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    {heading}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {option.values.map((value) => {
                      const label =
                        getLocalized(value.label, locale).trim() || value.value;
                      const isSelected = selectedValueId === value.id;
                      const available = isOptionValueAvailable(
                        variants,
                        options,
                        option.id,
                        value.id,
                        selectedByOptionId,
                      );
                      const swatch = value.swatchUrl
                        ? mediaSrc(value.swatchUrl)
                        : null;

                      if (option.uiType === "swatches") {
                        return (
                          <button
                            key={value.id}
                            type="button"
                            title={label}
                            disabled={!available}
                            onClick={() => onSelect(option.id, value.id)}
                            className={cn(
                              "relative h-12 w-12 shrink-0 overflow-hidden rounded-[3px] ring-2 ring-offset-1 ring-offset-background transition sm:h-14 sm:w-14",
                              isSelected
                                ? "ring-foreground"
                                : "ring-transparent opacity-90 hover:ring-foreground/25 hover:opacity-100",
                              !available && "cursor-not-allowed opacity-35",
                            )}
                            style={
                              !swatch && value.hex
                                ? { backgroundColor: value.hex }
                                : undefined
                            }
                            aria-pressed={isSelected}
                            aria-label={label}
                          >
                            {swatch ? (
                              <Image
                                src={swatch}
                                alt={label}
                                fill
                                unoptimized={
                                  swatch.includes("/uploads/") ||
                                  swatch.startsWith("http")
                                }
                                className="object-cover object-center"
                                sizes="56px"
                              />
                            ) : null}
                          </button>
                        );
                      }

                      return (
                        <button
                          key={value.id}
                          type="button"
                          disabled={!available}
                          onClick={() => onSelect(option.id, value.id)}
                          className={cn(
                            "min-w-[4.5rem] rounded-[3px] border px-3 py-2 text-sm transition",
                            isSelected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-card text-foreground hover:border-foreground/40",
                            !available &&
                              "cursor-not-allowed opacity-35 hover:border-border",
                          )}
                          aria-pressed={isSelected}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

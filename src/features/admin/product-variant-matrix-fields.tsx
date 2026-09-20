"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { AdminSelect } from "@/features/admin/admin-select";
import { FileUploadField } from "@/features/admin/file-upload";
import {
  Field,
  LocalizedInputs,
  adminFieldClass,
  emptyLocalized,
  asLocalized,
} from "@/features/admin/form-ui";
import {
  cartesianOptionCombos,
  comboKey,
} from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import { useLocale } from "next-intl";
import type {
  LocalizedString,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
} from "@/types";

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyOption(): ProductOption {
  return {
    id: uid("opt"),
    key: "",
    label: emptyLocalized(),
    uiType: "buttons",
    sortOrder: 0,
    values: [emptyOptionValue()],
  };
}

export function emptyOptionValue(): ProductOptionValue {
  return {
    id: uid("ov"),
    label: emptyLocalized(),
    value: "",
    hex: null,
    swatchUrl: null,
    sortOrder: 0,
  };
}

export function emptyVariant(optionValueIds: string[] = []): ProductVariant {
  return {
    id: uid("var"),
    sku: "",
    optionValueIds,
    imageUrl: "",
    thumbUrl: "",
    images: [],
    textureMapUrl: "",
    texturePreviewUrl: "",
    price: null,
    availability: null,
    height: null,
    width: null,
    depth: null,
    length: null,
    isDefault: false,
    sortOrder: 0,
  };
}

function slugKeyFromLabel(label: LocalizedString): string {
  const source = label.en || label.ru || label.am || "";
  return source
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function ProductVariantMatrixFields({
  options,
  variants,
  onOptionsChange,
  onVariantsChange,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
  onOptionsChange: (options: ProductOption[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const label = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  const updateOption = (index: number, next: ProductOption) => {
    const list = [...options];
    list[index] = next;
    onOptionsChange(list);
  };

  const updateVariant = (index: number, next: ProductVariant) => {
    const list = [...variants];
    list[index] = next;
    onVariantsChange(list);
  };

  const generateMissing = () => {
    const combos = cartesianOptionCombos(options);
    const existing = new Set(variants.map((variant) => comboKey(variant.optionValueIds)));
    const missing = combos
      .filter((combo) => !existing.has(comboKey(combo)))
      .map((combo, index) => ({
        ...emptyVariant(combo),
        sortOrder: variants.length + index,
        isDefault: variants.length === 0 && index === 0,
      }));
    if (missing.length > 0) onVariantsChange([...variants, ...missing]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {label("variantOptions", "Option axes")}
          </h3>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-border text-foreground"
            onClick={() =>
              onOptionsChange([
                ...options,
                { ...emptyOption(), sortOrder: options.length },
              ])
            }
          >
            <Plus />
            {label("addOption", "Add option")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {label(
            "variantOptionsHint",
            "Define axes such as height, type, or color. Each sellable combination is a variant below.",
          )}
        </p>

        {options.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            {label(
              "variantOptionsEmpty",
              "No option axes yet. Simple gallery images still work without a matrix.",
            )}
          </p>
        ) : null}

        {options.map((option, optionIndex) => (
          <div
            key={option.id}
            className="space-y-4 rounded-xl border border-border p-4"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label={label("optionKey", "Key")} required>
                <Input
                  value={option.key}
                  placeholder="height"
                  onChange={(e) =>
                    updateOption(optionIndex, {
                      ...option,
                      key: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-_]/g, ""),
                    })
                  }
                  className={adminFieldClass}
                />
              </Field>
              <Field label={label("optionUiType", "UI type")}>
                <AdminSelect
                  value={option.uiType}
                  placeholder={label("optionUiType", "UI type")}
                  onValueChange={(value) =>
                    updateOption(optionIndex, {
                      ...option,
                      uiType: value as ProductOption["uiType"],
                    })
                  }
                  options={[
                    { value: "buttons", label: label("uiButtons", "Buttons") },
                    { value: "swatches", label: label("uiSwatches", "Swatches") },
                  ]}
                />
              </Field>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-muted-foreground hover:text-red-600"
                  onClick={() => {
                    const removedValueIds = new Set(
                      option.values.map((value) => value.id),
                    );
                    onOptionsChange(options.filter((_, i) => i !== optionIndex));
                    onVariantsChange(
                      variants.map((variant) => ({
                        ...variant,
                        optionValueIds: variant.optionValueIds.filter(
                          (id) => !removedValueIds.has(id),
                        ),
                      })),
                    );
                  }}
                >
                  <Trash2 />
                  {t("delete")}
                </Button>
              </div>
            </div>

            <LocalizedInputs
              label={t("name")}
              value={option.label}
              onChange={(labelValue) => {
                const nextLabel = asLocalized(labelValue);
                updateOption(optionIndex, {
                  ...option,
                  label: nextLabel,
                  key: option.key || slugKeyFromLabel(nextLabel),
                });
              }}
            />

            <div className="space-y-3 border-t border-border pt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label("optionValues", "Values")}
              </h4>
              {option.values.map((value, valueIndex) => (
                <div
                  key={value.id}
                  className="space-y-3 rounded-[5px] border border-border/80 bg-muted/20 p-3"
                >
                  <LocalizedInputs
                    label={t("name")}
                    value={value.label}
                    onChange={(labelValue) => {
                      const nextLabel = asLocalized(labelValue);
                      const values = [...option.values];
                      values[valueIndex] = {
                        ...value,
                        label: nextLabel,
                        value:
                          value.value ||
                          slugKeyFromLabel(nextLabel) ||
                          nextLabel.en,
                      };
                      updateOption(optionIndex, { ...option, values });
                    }}
                  />
                  <div className="grid gap-3 md:grid-cols-3">
                    <Field label={label("optionValueCode", "Value code")}>
                      <Input
                        value={value.value}
                        placeholder="80"
                        onChange={(e) => {
                          const values = [...option.values];
                          values[valueIndex] = {
                            ...value,
                            value: e.target.value,
                          };
                          updateOption(optionIndex, { ...option, values });
                        }}
                        className={adminFieldClass}
                      />
                    </Field>
                    {option.uiType === "swatches" ? (
                      <>
                        <Field label="HEX">
                          <Input
                            value={value.hex ?? ""}
                            onChange={(e) => {
                              const values = [...option.values];
                              values[valueIndex] = {
                                ...value,
                                hex: e.target.value || null,
                              };
                              updateOption(optionIndex, { ...option, values });
                            }}
                            className={adminFieldClass}
                          />
                        </Field>
                        <Field label={label("swatchImage", "Swatch image")}>
                          <FileUploadField
                            value={value.swatchUrl ?? ""}
                            accept="image/*"
                            label={t("upload")}
                            onChange={(swatchUrl) => {
                              const values = [...option.values];
                              values[valueIndex] = {
                                ...value,
                                swatchUrl: swatchUrl || null,
                              };
                              updateOption(optionIndex, { ...option, values });
                            }}
                          />
                        </Field>
                      </>
                    ) : null}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-muted-foreground hover:text-red-600"
                      disabled={option.values.length <= 1}
                      onClick={() => {
                        const values = option.values.filter(
                          (_, i) => i !== valueIndex,
                        );
                        updateOption(optionIndex, { ...option, values });
                        onVariantsChange(
                          variants.map((variant) => ({
                            ...variant,
                            optionValueIds: variant.optionValueIds.filter(
                              (id) => id !== value.id,
                            ),
                          })),
                        );
                      }}
                    >
                      <Trash2 />
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border text-foreground"
                onClick={() =>
                  updateOption(optionIndex, {
                    ...option,
                    values: [
                      ...option.values,
                      {
                        ...emptyOptionValue(),
                        sortOrder: option.values.length,
                      },
                    ],
                  })
                }
              >
                <Plus />
                {label("addOptionValue", "Add value")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {label("variants", "Variants")}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-border text-foreground"
              disabled={options.length === 0}
              onClick={generateMissing}
            >
              {label("generateVariants", "Generate missing combos")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-border text-foreground"
              onClick={() =>
                onVariantsChange([
                  ...variants,
                  {
                    ...emptyVariant(
                      options
                        .map((option) => option.values[0]?.id)
                        .filter(Boolean) as string[],
                    ),
                    sortOrder: variants.length,
                    isDefault: variants.length === 0,
                  },
                ])
              }
            >
              <Plus />
              {label("addVariant", "Add variant")}
            </Button>
          </div>
        </div>

        {variants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            {label(
              "variantsEmpty",
              "No variants yet. Add option values, then generate combos or add rows manually.",
            )}
          </p>
        ) : null}

        {variants.map((variant, variantIndex) => (
          <div
            key={variant.id}
            className="space-y-4 rounded-xl border border-border p-4"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label={label("variantSku", "Article / SKU")} required>
                <Input
                  value={variant.sku}
                  onChange={(e) =>
                    updateVariant(variantIndex, {
                      ...variant,
                      sku: e.target.value,
                    })
                  }
                  className={adminFieldClass}
                />
              </Field>
              {options.map((option) => {
                const selected =
                  option.values.find((value) =>
                    variant.optionValueIds.includes(value.id),
                  )?.id ?? "";
                return (
                  <Field
                    key={option.id}
                    label={
                      getLocalized(option.label, locale) ||
                      option.key ||
                      label("option", "Option")
                    }
                  >
                    <AdminSelect
                      value={selected}
                      onValueChange={(valueId) => {
                        const withoutAxis = variant.optionValueIds.filter(
                          (id) => !option.values.some((value) => value.id === id),
                        );
                        updateVariant(variantIndex, {
                          ...variant,
                          optionValueIds: valueId
                            ? [...withoutAxis, valueId]
                            : withoutAxis,
                        });
                      }}
                      placeholder={label("selectValue", "Select")}
                      options={option.values.map((value) => ({
                        value: value.id,
                        label:
                          getLocalized(value.label, locale) ||
                          value.value ||
                          value.id,
                      }))}
                    />
                  </Field>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label={label("galleryVariantImage", "Main image")}>
                <FileUploadField
                  value={variant.imageUrl ?? ""}
                  accept="image/*"
                  label={t("upload")}
                  onChange={(imageUrl) =>
                    updateVariant(variantIndex, {
                      ...variant,
                      imageUrl,
                      thumbUrl: variant.thumbUrl || imageUrl,
                    })
                  }
                />
              </Field>
              <Field label={label("galleryVariantThumb", "Thumb")}>
                <FileUploadField
                  value={variant.thumbUrl ?? ""}
                  accept="image/*"
                  label={t("upload")}
                  onChange={(thumbUrl) =>
                    updateVariant(variantIndex, { ...variant, thumbUrl })
                  }
                />
              </Field>
              <Field label={label("textureMap", "Texture map")}>
                <FileUploadField
                  value={variant.textureMapUrl ?? ""}
                  accept="image/*"
                  label={t("upload")}
                  onChange={(textureMapUrl) =>
                    updateVariant(variantIndex, {
                      ...variant,
                      textureMapUrl,
                    })
                  }
                />
              </Field>
              <Field label={label("texturePreview", "Texture preview")}>
                <FileUploadField
                  value={variant.texturePreviewUrl ?? ""}
                  accept="image/*"
                  label={t("upload")}
                  onChange={(texturePreviewUrl) =>
                    updateVariant(variantIndex, {
                      ...variant,
                      texturePreviewUrl,
                    })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label={t("price")}>
                <Input
                  type="number"
                  min={0}
                  value={variant.price ?? ""}
                  placeholder={label("inheritParent", "Inherit")}
                  onChange={(e) =>
                    updateVariant(variantIndex, {
                      ...variant,
                      price:
                        e.target.value === ""
                          ? null
                          : Number(e.target.value) || 0,
                    })
                  }
                  className={adminFieldClass}
                />
              </Field>
              <Field label={label("availability", "Availability")}>
                <AdminSelect
                  value={variant.availability ?? "__inherit__"}
                  onValueChange={(value) =>
                    updateVariant(variantIndex, {
                      ...variant,
                      availability:
                        value === "__inherit__"
                          ? null
                          : (value as ProductVariant["availability"]),
                    })
                  }
                  placeholder={label("inheritParent", "Inherit")}
                  options={[
                    { value: "__inherit__", label: label("inheritParent", "Inherit") },
                    { value: "in_stock", label: "In stock" },
                    { value: "limited", label: "Limited" },
                    { value: "preorder", label: "Preorder" },
                  ]}
                />
              </Field>
              <label className="flex items-end gap-3 pb-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={Boolean(variant.isDefault)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onVariantsChange(
                      variants.map((entry, i) => ({
                        ...entry,
                        isDefault: i === variantIndex ? checked : false,
                      })),
                    );
                  }}
                  className="h-4 w-4 accent-accent"
                />
                {label("defaultVariant", "Default variant")}
              </label>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "text-muted-foreground hover:text-red-600",
                )}
                onClick={() =>
                  onVariantsChange(
                    variants.filter((_, i) => i !== variantIndex),
                  )
                }
              >
                <Trash2 />
                {t("delete")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

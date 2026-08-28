"use client";

import { useLocale, useTranslations } from "next-intl";
import { Field } from "@/features/admin/form-ui";
import { AdminSelect } from "@/features/admin/admin-select";
import { getLocalized } from "@/data/catalog";
import { childCategories, parentCategories } from "@/lib/category-tree";
import type { ProductCategory } from "@/types";

export function CategoryAttachFields({
  categories,
  value,
  onChange,
  error,
}: {
  categories: ProductCategory[];
  value: string;
  onChange: (id: string) => void;
  error?: string | null;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const parents = parentCategories(categories);
  const selected = categories.find((category) => category.id === value);
  const parentId = selected?.parentId || selected?.id || "";
  const children = parentId ? childCategories(categories, parentId) : [];

  return (
    <div className="space-y-4">
      <Field label={t("parentCategory")} required error={error}>
        <AdminSelect
          value={parentId}
          onValueChange={(next) => onChange(next)}
          placeholder={t("selectCategory")}
          options={parents.map((category) => ({
            value: category.id,
            label: getLocalized(category.name, locale),
          }))}
        />
      </Field>
      {children.length > 0 && (
        <Field label={t("selectSubcategory")}>
          <AdminSelect
            value={value}
            onValueChange={onChange}
            placeholder={t("selectSubcategory")}
            options={[
              { value: parentId, label: t("thisCategory") },
              ...children.map((category) => ({
                value: category.id,
                label: getLocalized(category.name, locale),
              })),
            ]}
          />
        </Field>
      )}
      <p className="text-xs text-foreground0">{t("categoryHint")}</p>
    </div>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { Field } from "@/features/admin/form-ui";
import { AdminSelect } from "@/features/admin/admin-select";
import { getLocalized } from "@/data/catalog";
import { categorySelectOptions } from "@/lib/category-tree";
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
  const options = categorySelectOptions(categories, (category) =>
    getLocalized(category.name, locale),
  );

  return (
    <div className="space-y-4">
      <Field label={t("selectCategory")} required error={error}>
        <AdminSelect
          value={value}
          onValueChange={onChange}
          placeholder={t("selectCategory")}
          options={options}
        />
      </Field>
    </div>
  );
}

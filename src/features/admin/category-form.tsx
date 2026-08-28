"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/atoms/input";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import {
  Field,
  FormActions,
  LocalizedInputs,
  Section,
  adminFieldClass,
  asLocalized,
  slugify,
  useRequiredFieldMessage,
} from "@/features/admin/form-ui";
import { adminApi, catalogApi, ApiError } from "@/lib/api";
import { FileUploadField } from "@/features/admin/file-upload";
import { AdminSelect } from "@/features/admin/admin-select";
import { getLocalized } from "@/data/catalog";
import { categorySelectOptions, descendantCategoryIds } from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import type { LocalizedString, ProductCategory } from "@/types";

export function CategoryForm({
  category,
  defaultParentId,
}: {
  category?: ProductCategory;
  defaultParentId?: string;
}) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const isEdit = Boolean(category);
  const [name, setName] = useState<LocalizedString>(() => asLocalized(category?.name));
  const [description, setDescription] = useState<LocalizedString>(() =>
    asLocalized(category?.description),
  );
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [image, setImage] = useState(category?.image ?? "/products/plinth.jpg");
  const [parentId, setParentId] = useState(category?.parentId ?? defaultParentId ?? "");
  const [allCategories, setAllCategories] = useState<ProductCategory[]>([]);
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ nameEn?: string; slug?: string }>({});

  useEffect(() => {
    catalogApi.categories().then((items) => setAllCategories(items ?? []));
  }, [category?.id]);

  const parentOptions = categorySelectOptions(
    allCategories,
    (item) => getLocalized(item.name, locale),
    category
      ? {
          excludeIds: [category.id, ...descendantCategoryIds(category.id, allCategories)],
        }
      : undefined,
  );

  const requiredMsg = useRequiredFieldMessage();
  const slugTakenMsg = t.has("slugTaken")
    ? t("slugTaken")
    : "Այս slug-ը արդեն օգտագործված է։";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextName = asLocalized(name);
    const nextSlug = (slug ?? "").trim();
    const nextErrors: { nameEn?: string; slug?: string } = {};
    if (!nextName.en.trim()) nextErrors.nameEn = requiredMsg;
    if (!nextSlug) nextErrors.slug = requiredMsg;
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError(null);
      return;
    }
    setSaving(true);
    setError(null);
    setFieldErrors({});
    const payload = {
      name: nextName,
      description: asLocalized(description),
      slug: nextSlug,
      image,
      parentId: parentId || null,
    };
    try {
      if (isEdit && category) await adminApi.updateCategory(category.id, payload);
      else await adminApi.createCategory(payload);
      router.replace("/admin/categories");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ slug: slugTakenMsg });
        setError(null);
      } else if (err instanceof ApiError && err.message) {
        setError(err.message);
      } else {
        setError(t("saveError"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={isEdit ? t("editCategory") : t("createCategory")} />
        <form onSubmit={handleSubmit} className="space-y-6 pb-16" noValidate>
          <Section title={t("name")}>
            <LocalizedInputs
              label={t("name")}
              value={name}
              requiredLocales={["en"]}
              errors={{ en: fieldErrors.nameEn }}
              onChange={(value) => {
                const next = asLocalized(value);
                setName(next);
                if (fieldErrors.nameEn) setFieldErrors((prev) => ({ ...prev, nameEn: undefined }));
                if (!slugLocked) setSlug(slugify(next.en));
              }}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Slug" required error={fieldErrors.slug}>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    setSlug(slugify(e.target.value));
                    if (fieldErrors.slug) setFieldErrors((prev) => ({ ...prev, slug: undefined }));
                  }}
                  className={cn(adminFieldClass, fieldErrors.slug && "border-red-500")}
                  aria-invalid={Boolean(fieldErrors.slug)}
                />
              </Field>
              <Field label={t("parentCategory")}>
                <AdminSelect
                  value={parentId || "__none__"}
                  onValueChange={(value) => setParentId(value === "__none__" ? "" : value)}
                  placeholder={t("parentCategory")}
                  options={[
                    { value: "__none__", label: t("topLevelCategory") },
                    ...parentOptions,
                  ]}
                />
              </Field>
              <Field label={t("images")}>
                <FileUploadField value={image} onChange={setImage} accept="image/*" label={t("upload")} />
              </Field>
            </div>
          </Section>
          <Section title={t("description")}>
            <LocalizedInputs
              label={t("description")}
              value={description}
              onChange={setDescription}
              multiline
            />
          </Section>
          <FormActions
            cancelHref="/admin/categories"
            cancelLabel={t("cancel")}
            saveLabel={saving ? t("saving") : isEdit ? t("save") : t("create")}
            saving={saving}
            error={error}
          />
        </form>
      </AdminShell>
    </AuthGate>
  );
}

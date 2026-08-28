"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import { AdminSelect } from "@/features/admin/admin-select";
import { FileUploadField } from "@/features/admin/file-upload";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Collection, LocalizedString } from "@/types";

export function CollectionForm({ collection }: { collection?: Collection }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEdit = Boolean(collection);
  const [name, setName] = useState<LocalizedString>(() => asLocalized(collection?.name));
  const [description, setDescription] = useState<LocalizedString>(() =>
    asLocalized(collection?.description),
  );
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [image, setImage] = useState(collection?.image ?? "/products/plinth.png");
  const [style, setStyle] = useState(collection?.style ?? "modern");
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ nameEn?: string; slug?: string }>({});
  const requiredMsg = useRequiredFieldMessage();

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
      style,
    };
    try {
      if (isEdit && collection) await adminApi.updateCollection(collection.id, payload);
      else await adminApi.createCollection(payload);
      router.replace("/admin/collections");
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={isEdit ? t("editCollection") : t("createCollection")} />
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
            <div className="grid gap-4 md:grid-cols-3">
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
              <Field label="Style">
                <AdminSelect
                  value={style}
                  onValueChange={setStyle}
                  placeholder="Style"
                  options={[
                    { value: "minimal", label: "minimal" },
                    { value: "natural", label: "natural" },
                    { value: "modern", label: "modern" },
                    { value: "classic", label: "classic" },
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
            cancelHref="/admin/collections"
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

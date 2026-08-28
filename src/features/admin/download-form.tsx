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
  useRequiredFieldMessage,
} from "@/features/admin/form-ui";
import { AdminSelect } from "@/features/admin/admin-select";
import { FileUploadField } from "@/features/admin/file-upload";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { DownloadCategory, DownloadFile, LocalizedString } from "@/types";

const CATEGORIES: DownloadCategory[] = [
  "catalogs",
  "templates",
  "collections",
  "pdf",
  "cad",
  "bim",
  "guides",
  "other",
];

type FieldErrors = {
  titleEn?: string;
  filename?: string;
  url?: string;
};

export function DownloadForm({ file }: { file?: DownloadFile }) {
  const t = useTranslations("admin");
  const td = useTranslations("downloads");
  const router = useRouter();
  const isEdit = Boolean(file);
  const [title, setTitle] = useState<LocalizedString>(() => asLocalized(file?.title));
  const [filename, setFilename] = useState(file?.filename ?? "");
  const [category, setCategory] = useState<DownloadCategory>(file?.category ?? "catalogs");
  const [url, setUrl] = useState(file?.url ?? "");
  const [size, setSize] = useState(file?.size ?? "");
  const [downloadable, setDownloadable] = useState(file?.downloadable ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const requiredMsg = useRequiredFieldMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextTitle = asLocalized(title);
    const nextFilename = (filename ?? "").trim();
    const nextUrl = (url ?? "").trim();
    const nextErrors: FieldErrors = {};

    if (!nextTitle.en.trim()) nextErrors.titleEn = requiredMsg;
    if (!nextFilename) nextErrors.filename = requiredMsg;
    if (!nextUrl) nextErrors.url = requiredMsg;

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    setFieldErrors({});
    const payload = {
      title: nextTitle,
      filename: nextFilename,
      category,
      url: nextUrl,
      size,
      downloadable,
    };
    try {
      if (isEdit && file) await adminApi.updateDownload(file.id, payload);
      else await adminApi.createDownload(payload);
      router.replace("/admin/downloads");
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={isEdit ? t("editDownload") : t("createDownload")} />
        <form onSubmit={handleSubmit} className="space-y-6 pb-16" noValidate>
          <Section title={t("name")}>
            <LocalizedInputs
              label={t("name")}
              value={title}
              requiredLocales={["en"]}
              errors={{ en: fieldErrors.titleEn }}
              onChange={(value) => {
                setTitle(asLocalized(value));
                if (fieldErrors.titleEn) setFieldErrors((prev) => ({ ...prev, titleEn: undefined }));
              }}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("filename")} required error={fieldErrors.filename}>
                <Input
                  value={filename}
                  onChange={(e) => {
                    setFilename(e.target.value);
                    if (fieldErrors.filename) setFieldErrors((prev) => ({ ...prev, filename: undefined }));
                  }}
                  className={cn(adminFieldClass, fieldErrors.filename && "border-red-500")}
                  aria-invalid={Boolean(fieldErrors.filename)}
                />
              </Field>
              <Field label={td("categories")}>
                <AdminSelect
                  value={category}
                  onValueChange={(value) => setCategory(value as DownloadCategory)}
                  placeholder={td("categories")}
                  options={CATEGORIES.map((item) => ({ value: item, label: td(item) }))}
                />
              </Field>
            </div>
          </Section>
          <Section title={t("files")}>
            <Field label={t("upload")} required error={fieldErrors.url}>
              <FileUploadField
                value={url}
                label={t("upload")}
                onChange={(next, meta) => {
                  setUrl(next);
                  if (fieldErrors.url) setFieldErrors((prev) => ({ ...prev, url: undefined }));
                  if (meta?.name && !filename) setFilename(meta.name);
                  if (meta?.size) setSize(`${Math.max(1, Math.round(meta.size / 1024))} KB`);
                }}
              />
            </Field>
            <label className="mt-4 flex items-center gap-3 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={downloadable}
                onChange={(e) => setDownloadable(e.target.checked)}
              />
              {t("downloadable")}
            </label>
          </Section>
          <FormActions
            cancelHref="/admin/downloads"
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

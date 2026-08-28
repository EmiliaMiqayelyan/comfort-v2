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
import { FileUploadField } from "@/features/admin/file-upload";
import { adminApi } from "@/lib/api";
import type { Certificate, LocalizedString } from "@/types";

export function CertificateForm({ certificate }: { certificate?: Certificate }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEdit = Boolean(certificate);
  const [title, setTitle] = useState<LocalizedString>(() => asLocalized(certificate?.title));
  const [issuer, setIssuer] = useState(certificate?.issuer ?? "");
  const [year, setYear] = useState(String(certificate?.year ?? new Date().getFullYear()));
  const [fileUrl, setFileUrl] = useState(certificate?.fileUrl ?? "");
  const [image, setImage] = useState(certificate?.image ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ titleEn?: string; fileUrl?: string }>({});
  const requiredMsg = useRequiredFieldMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextTitle = asLocalized(title);
    const nextFileUrl = (fileUrl ?? "").trim();
    const nextErrors: { titleEn?: string; fileUrl?: string } = {};
    if (!nextTitle.en.trim()) nextErrors.titleEn = requiredMsg;
    if (!nextFileUrl) nextErrors.fileUrl = requiredMsg;
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
      issuer,
      year: Number(year) || undefined,
      fileUrl: nextFileUrl,
      image: image || undefined,
    };
    try {
      if (isEdit && certificate) await adminApi.updateCertificate(certificate.id, payload);
      else await adminApi.createCertificate(payload);
      router.replace("/admin/certificates");
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={isEdit ? t("editCertificate") : t("createCertificate")} />
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
              <Field label={t("issuer")}>
                <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} className={adminFieldClass} />
              </Field>
              <Field label={t("year")}>
                <Input value={year} onChange={(e) => setYear(e.target.value)} className={adminFieldClass} />
              </Field>
            </div>
          </Section>
          <Section title={t("files")}>
            <Field label={t("certificateFile")} required error={fieldErrors.fileUrl}>
              <FileUploadField
                value={fileUrl}
                onChange={(next) => {
                  setFileUrl(next);
                  if (fieldErrors.fileUrl) setFieldErrors((prev) => ({ ...prev, fileUrl: undefined }));
                }}
                accept=".pdf,image/*"
                label={t("upload")}
              />
            </Field>
            <Field label={t("images")}>
              <FileUploadField value={image} onChange={setImage} accept="image/*" label={t("upload")} />
            </Field>
          </Section>
          <FormActions
            cancelHref="/admin/certificates"
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

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
import type { LocalizedString, Partner } from "@/types";

export function PartnerForm({ partner }: { partner?: Partner }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEdit = Boolean(partner);
  const [title, setTitle] = useState<LocalizedString>(() => asLocalized(partner?.title));
  const [logo, setLogo] = useState(partner?.logo ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(partner?.websiteUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(partner?.sortOrder ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ titleEn?: string; logo?: string }>({});
  const requiredMsg = useRequiredFieldMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextTitle = asLocalized(title);
    const nextLogo = (logo ?? "").trim();
    const nextErrors: { titleEn?: string; logo?: string } = {};
    if (!nextTitle.en.trim()) nextErrors.titleEn = requiredMsg;
    if (!nextLogo) nextErrors.logo = requiredMsg;
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
      logo: nextLogo,
      websiteUrl: websiteUrl.trim() || null,
      sortOrder: Number(sortOrder) || 0,
    };
    try {
      if (isEdit && partner) await adminApi.updatePartner(partner.id, payload);
      else await adminApi.createPartner(payload);
      router.replace("/admin/partners");
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={isEdit ? t("editPartner") : t("createPartner")} />
        <form onSubmit={handleSubmit} className="space-y-6 pb-16" noValidate>
          <Section title={t("partnerTitle")}>
            <LocalizedInputs
              label={t("partnerTitle")}
              value={title}
              requiredLocales={["en"]}
              errors={{ en: fieldErrors.titleEn }}
              onChange={(value) => {
                setTitle(asLocalized(value));
                if (fieldErrors.titleEn) setFieldErrors((prev) => ({ ...prev, titleEn: undefined }));
              }}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("websiteUrl")}>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://"
                  className={adminFieldClass}
                />
              </Field>
              <Field label={t("sortOrder")}>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={adminFieldClass}
                />
              </Field>
            </div>
          </Section>
          <Section title={t("images")}>
            <Field label={t("partnerLogo")} required error={fieldErrors.logo}>
              <FileUploadField
                value={logo}
                onChange={(next) => {
                  setLogo(next);
                  if (fieldErrors.logo) setFieldErrors((prev) => ({ ...prev, logo: undefined }));
                }}
                accept="image/*,.svg"
                label={t("upload")}
              />
            </Field>
          </Section>
          <FormActions
            cancelHref="/admin/partners"
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

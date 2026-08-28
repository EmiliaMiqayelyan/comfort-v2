"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { cn } from "@/lib/utils";
import { asLocalized, emptyLocalized } from "@/lib/localized";
import type { LocalizedString } from "@/types";

export { asLocalized, emptyLocalized };

export const adminFieldClass =
  "rounded-xl border-border bg-white text-foreground placeholder:text-muted-foreground";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0561-\u0587]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
  error,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string | null;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-foreground/80">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function LocalizedInputs({
  label,
  value,
  onChange,
  multiline,
  errors,
  requiredLocales = [],
}: {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  multiline?: boolean;
  errors?: Partial<Record<"en" | "ru" | "am", string | null | undefined>>;
  requiredLocales?: Array<"en" | "ru" | "am">;
}) {
  const Control = multiline ? Textarea : Input;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {(["en", "ru", "am"] as const).map((locale) => (
        <Field
          key={locale}
          label={`${label} (${locale.toUpperCase()})`}
          required={requiredLocales.includes(locale)}
          error={errors?.[locale]}
        >
          <Control
            value={value?.[locale] ?? ""}
            onChange={(e) => onChange({ ...asLocalized(value), [locale]: e.target.value })}
            className={cn(adminFieldClass, errors?.[locale] && "border-red-500 focus-visible:ring-red-500/30")}
            rows={multiline ? 4 : undefined}
            aria-invalid={Boolean(errors?.[locale])}
          />
        </Field>
      ))}
    </div>
  );
}

export function FormActions({
  cancelHref,
  cancelLabel,
  saveLabel,
  saving,
  error,
}: {
  cancelHref: string;
  cancelLabel: string;
  saveLabel: string;
  saving: boolean;
  error?: string | null;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
      <div className="flex gap-3">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={cancelHref}>{cancelLabel}</Link>
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#203E4B] text-white hover:bg-[#203E4B]/90"
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

export function useRequiredFieldMessage() {
  const t = useTranslations("admin");
  return t.has("fieldRequired") ? t("fieldRequired") : t("requiredFields");
}

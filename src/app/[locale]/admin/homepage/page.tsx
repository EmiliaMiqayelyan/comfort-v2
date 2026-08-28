"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import { Field, Section, useRequiredFieldMessage } from "@/features/admin/form-ui";
import { FileUploadField } from "@/features/admin/file-upload";
import { Button } from "@/components/atoms/button";
import { adminApi, catalogApi } from "@/lib/api";
import type { HeroSettings } from "@/types";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80";

const LEGACY_DEFAULT_HERO_IMAGES = [
  DEFAULT_HERO_IMAGE,
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2400&q=80",
];

function normalizeImages(settings: HeroSettings | null | undefined): string[] {
  const fromArray = (settings?.images ?? []).map((item) => item.trim()).filter(Boolean);
  if (fromArray.length > 0) {
    const isLegacyDefault =
      fromArray.length === LEGACY_DEFAULT_HERO_IMAGES.length &&
      fromArray.every((item, index) => item === LEGACY_DEFAULT_HERO_IMAGES[index]);
    return isLegacyDefault ? [DEFAULT_HERO_IMAGE] : fromArray;
  }
  if (settings?.image?.trim()) return [settings.image.trim()];
  return [""];
}

export default function AdminHomepagePage() {
  const t = useTranslations("admin");
  const requiredMsg = useRequiredFieldMessage();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    catalogApi.heroSettings().then((settings) => {
      const next = normalizeImages(settings);
      setImages(next.length > 0 ? next : [""]);
    });
  }, []);

  const updateImage = (index: number, value: string) => {
    setImages((prev) => prev.map((item, i) => (i === index ? value : item)));
    setSaved(false);
    if (fieldError) setFieldError(null);
  };

  const addImage = () => {
    setImages((prev) => [...prev, ""]);
    setSaved(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
    setSaved(false);
  };

  const save = async () => {
    const next = images.map((item) => item.trim()).filter(Boolean);
    if (next.length === 0) {
      setFieldError(requiredMsg);
      setSaved(false);
      return;
    }
    setSaving(true);
    setError(null);
    setFieldError(null);
    setSaved(false);
    try {
      const payload: HeroSettings = { images: next, image: next[0] };
      const savedSettings = await adminApi.updateHeroSettings(payload);
      const normalized = normalizeImages(savedSettings);
      setImages(normalized);
      await queryClient.invalidateQueries({ queryKey: ["hero-settings"] });
      setSaved(true);
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader
          title={t("homepage")}
          description={t.has("heroImageDesc") ? t("heroImageDesc") : t("homepageDesc")}
        />

        <Section title={t.has("heroImage") ? t("heroImage") : t("homepage")}>
          <div className="space-y-5">
            {images.map((image, index) => (
              <div
                key={`hero-slide-${index}`}
                className="rounded-2xl border border-border bg-[#fafafa] p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {t.has("heroSlide") ? t("heroSlide") : t("images")} {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={images.length <= 1}
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("delete")}
                  </Button>
                </div>

                <Field
                  label={t.has("heroImage") ? t("heroImage") : t("images")}
                  required={index === 0}
                  error={index === 0 ? fieldError : null}
                >
                  <FileUploadField
                    value={image}
                    accept="image/*"
                    label={t("upload")}
                    onChange={(next) => updateImage(index, next)}
                  />
                </Field>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button type="button" variant="outline" className="rounded-xl" onClick={addImage}>
              <Plus className="h-4 w-4" />
              {t("addImage")}
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-xl bg-[#203E4B] text-white hover:bg-[#203E4B]/90"
            >
              {saving ? t("saving") : t("save")}
            </Button>
            {saved ? <p className="text-sm text-emerald-700">{t("saved")}</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </Section>
      </AdminShell>
    </AuthGate>
  );
}

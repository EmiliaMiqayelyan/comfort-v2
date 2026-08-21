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
} from "@/features/admin/form-ui";
import { adminApi } from "@/lib/api";
import type { LocalizedString, Project } from "@/types";

export function ProjectForm({ project }: { project?: Project }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEdit = Boolean(project);
  const [title, setTitle] = useState<LocalizedString>(() => asLocalized(project?.title));
  const [description, setDescription] = useState<LocalizedString>(() =>
    asLocalized(project?.description),
  );
  const [location, setLocation] = useState<LocalizedString>(() =>
    asLocalized(project?.location),
  );
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [year, setYear] = useState(project?.year ?? new Date().getFullYear());
  const [category, setCategory] = useState(project?.category ?? "residential");
  const [images, setImages] = useState(project?.images?.join("\n") ?? "/products/plinth.png");
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextTitle = asLocalized(title);
    const nextSlug = (slug ?? "").trim();
    if (!nextTitle.en.trim() || !nextSlug) {
      setError(t("requiredFields"));
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: nextTitle,
      description: asLocalized(description),
      location: asLocalized(location),
      slug: nextSlug,
      year,
      category,
      images: images.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
      products: project?.products ?? [],
    };
    try {
      if (isEdit && project) await adminApi.updateProject(project.id, payload);
      else await adminApi.createProject(payload);
      router.replace("/admin/projects");
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={isEdit ? t("editProject") : t("createProject")} />
        <form onSubmit={handleSubmit} className="space-y-6 pb-16">
          <Section title={t("name")}>
            <LocalizedInputs
              label={t("name")}
              value={title}
              onChange={(value) => {
                const next = asLocalized(value);
                setTitle(next);
                if (!slugLocked) setSlug(slugify(next.en));
              }}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Slug">
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className={adminFieldClass}
                />
              </Field>
              <Field label="Year">
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value) || year)}
                  className={adminFieldClass}
                />
              </Field>
              <Field label={t("categories")}>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={adminFieldClass}
                />
              </Field>
            </div>
          </Section>
          <Section title={t("description")}>
            <LocalizedInputs label={t("description")} value={description} onChange={setDescription} multiline />
            <LocalizedInputs label="Location" value={location} onChange={setLocation} />
            <Field label={t("images")}>
              <Input
                value={images}
                onChange={(e) => setImages(e.target.value)}
                className={adminFieldClass}
                placeholder="/products/plinth.png"
              />
            </Field>
          </Section>
          <FormActions
            cancelHref="/admin/projects"
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

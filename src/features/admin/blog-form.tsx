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
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { BlogPost, LocalizedString } from "@/types";

export function BlogForm({ post }: { post?: BlogPost }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const isEdit = Boolean(post);
  const [title, setTitle] = useState<LocalizedString>(() => asLocalized(post?.title));
  const [excerpt, setExcerpt] = useState<LocalizedString>(() => asLocalized(post?.excerpt));
  const [content, setContent] = useState<LocalizedString>(() => asLocalized(post?.content));
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? "/products/plinth.png");
  const [category, setCategory] = useState(post?.category ?? "design");
  const [tags, setTags] = useState(post?.tags?.join(", ") ?? "");
  const [authorName, setAuthorName] = useState(post?.author?.name ?? "Admin");
  const [publishedAt, setPublishedAt] = useState(
    post?.publishedAt ?? new Date().toISOString().slice(0, 10),
  );
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ titleEn?: string; slug?: string }>({});
  const requiredMsg = useRequiredFieldMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextTitle = asLocalized(title);
    const nextSlug = (slug ?? "").trim();
    const nextErrors: { titleEn?: string; slug?: string } = {};
    if (!nextTitle.en.trim()) nextErrors.titleEn = requiredMsg;
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
      title: nextTitle,
      excerpt: asLocalized(excerpt),
      content: asLocalized(content),
      slug: nextSlug,
      coverImage,
      category,
      tags: tags.split(",").map((item) => item.trim()).filter(Boolean),
      publishedAt,
      author: {
        id: post?.author?.id ?? "admin",
        name: authorName,
        avatar: post?.author?.avatar ?? "/products/plinth.png",
        role: asLocalized(post?.author?.role ?? { en: "Editor", ru: "Редактор", am: "Խմբագիր" }),
      },
    };
    try {
      if (isEdit && post) await adminApi.updatePost(post.id, payload);
      else await adminApi.createPost(payload);
      router.replace("/admin/blog");
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader title={isEdit ? t("editPost") : t("createPost")} />
        <form onSubmit={handleSubmit} className="space-y-6 pb-16" noValidate>
          <Section title={t("name")}>
            <LocalizedInputs
              label={t("name")}
              value={title}
              requiredLocales={["en"]}
              errors={{ en: fieldErrors.titleEn }}
              onChange={(value) => {
                const next = asLocalized(value);
                setTitle(next);
                if (fieldErrors.titleEn) setFieldErrors((prev) => ({ ...prev, titleEn: undefined }));
                if (!slugLocked) setSlug(slugify(next.en));
              }}
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <Field label={t("categories")}>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} className={adminFieldClass} />
              </Field>
              <Field label="Author">
                <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className={adminFieldClass} />
              </Field>
              <Field label="Date">
                <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={adminFieldClass} />
              </Field>
            </div>
            <Field label={t("images")}>
              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={adminFieldClass} />
            </Field>
            <Field label="Tags">
              <Input value={tags} onChange={(e) => setTags(e.target.value)} className={adminFieldClass} />
            </Field>
          </Section>
          <Section title={t("description")}>
            <LocalizedInputs label="Excerpt" value={excerpt} onChange={setExcerpt} multiline />
            <LocalizedInputs label="Content" value={content} onChange={setContent} multiline />
          </Section>
          <FormActions
            cancelHref="/admin/blog"
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

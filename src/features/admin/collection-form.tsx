"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
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
import { FileUploadField } from "@/features/admin/file-upload";
import { AdminSelect } from "@/features/admin/admin-select";
import { GalleryVariantsFields } from "@/features/admin/gallery-variants-fields";
import {
  toCatalogFormFields,
  buildCatalogPayload,
  asArray,
  emptyColor,
  emptyTexture,
  emptySpec,
  emptyDownload,
  formatBytes,
} from "@/features/admin/catalog-form-utils";
import { useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type {
  Collection,
  LocalizedString,
  ProductColor,
  ProductDownload,
  ProductGalleryVariant,
  ProductSpec,
  ProductTexture,
} from "@/types";

type CollectionFormState = ReturnType<typeof toCatalogFormFields> & { style: string };

const STYLE_OPTIONS = [
  { value: "minimal", label: "minimal" },
  { value: "natural", label: "natural" },
  { value: "modern", label: "modern" },
  { value: "classic", label: "classic" },
] as const;

export function CollectionForm({ collection }: { collection?: Collection }) {
  const t = useTranslations("admin");
  const tp = useTranslations("product");
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(collection);
  const label = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const [form, setForm] = useState<CollectionFormState>(() => ({
    ...toCatalogFormFields(collection),
    style: collection?.style ?? "modern",
  }));
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ nameEn?: string; slug?: string }>({});
  const requiredMsg = useRequiredFieldMessage();

  const update = <K extends keyof CollectionFormState>(
    key: K,
    value: CollectionFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "slug") {
      setFieldErrors((prev) => ({ ...prev, slug: undefined }));
    }
  };

  const handleNameChange = (name: LocalizedString) => {
    const next = asLocalized(name);
    setFieldErrors((prev) => ({ ...prev, nameEn: undefined }));
    setForm((prev) => ({
      ...prev,
      name: next,
      slug: slugLocked ? prev.slug : slugify(next.en),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = asLocalized(form.name);
    const slug = (form.slug ?? "").trim();
    const nextErrors: typeof fieldErrors = {};
    if (!name.en.trim()) nextErrors.nameEn = requiredMsg;
    if (!slug) nextErrors.slug = requiredMsg;

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setSaving(true);
    setFieldErrors({});
    const payload: Partial<Collection> = {
      ...buildCatalogPayload(form),
      style: form.style,
    };

    try {
      if (isEdit && collection) {
        await adminApi.updateCollection(collection.id, payload);
      } else {
        await adminApi.createCollection(payload);
      }
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
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
          <Section title={t("identity")}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label={tp("sku")}>
                <Input
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value)}
                  className={adminFieldClass}
                />
              </Field>
              <Field label="Slug" required error={fieldErrors.slug}>
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugLocked(true);
                    update("slug", slugify(e.target.value));
                  }}
                  className={cn(adminFieldClass, fieldErrors.slug && "border-red-500")}
                  aria-invalid={Boolean(fieldErrors.slug)}
                />
              </Field>
              <Field label={tp("availability")}>
                <AdminSelect
                  value={form.availability}
                  onValueChange={(value) =>
                    update("availability", value as Collection["availability"])
                  }
                  placeholder={tp("availability")}
                  options={[
                    { value: "in_stock", label: tp("inStock") },
                    { value: "limited", label: tp("limited") },
                    { value: "preorder", label: tp("preorder") },
                  ]}
                />
              </Field>
              <Field label={t("price")}>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => update("price", Number(e.target.value) || 0)}
                  className={adminFieldClass}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={label("style", "Style")}>
                <AdminSelect
                  value={form.style}
                  onValueChange={(style) => update("style", style)}
                  placeholder={label("style", "Style")}
                  options={[...STYLE_OPTIONS]}
                />
              </Field>
            </div>
            <label className="flex items-center gap-3 text-sm text-foreground/80">
              <input
                type="checkbox"
                checked={Boolean(form.featured)}
                onChange={(e) => update("featured", e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              {t("featured")}
            </label>
          </Section>

          <Section title={t("name")}>
            <LocalizedInputs
              label={t("name")}
              value={form.name}
              onChange={handleNameChange}
              requiredLocales={["en"]}
              errors={{ en: fieldErrors.nameEn }}
            />
          </Section>

          <Section title={t("description")}>
            <LocalizedInputs
              label={t("description")}
              value={form.description}
              onChange={(description) => update("description", description)}
              multiline
            />
          </Section>

          <Section title={t("dimensions")}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Field label={`${tp("height")} (mm)`}>
                <Input
                  type="number"
                  min={0}
                  value={form.height}
                  onChange={(e) => update("height", Number(e.target.value) || 0)}
                  className={adminFieldClass}
                />
              </Field>
              <Field label={`${t("width")} (mm)`}>
                <Input
                  type="number"
                  min={0}
                  value={form.width}
                  onChange={(e) => update("width", Number(e.target.value) || 0)}
                  className={adminFieldClass}
                />
              </Field>
              <Field label={`${tp("depth")} (mm)`}>
                <Input
                  type="number"
                  min={0}
                  value={form.depth}
                  onChange={(e) => update("depth", Number(e.target.value) || 0)}
                  className={adminFieldClass}
                />
              </Field>
              <Field label={`${tp("length")} (mm)`}>
                <Input
                  type="number"
                  min={0}
                  value={form.length}
                  onChange={(e) => update("length", Number(e.target.value) || 0)}
                  className={adminFieldClass}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={tp("material")}>
                <Input
                  value={form.material}
                  onChange={(e) => update("material", e.target.value)}
                  className={adminFieldClass}
                />
              </Field>
              <Field label={tp("finish")}>
                <Input
                  value={form.finish}
                  onChange={(e) => update("finish", e.target.value)}
                  className={adminFieldClass}
                />
              </Field>
            </div>
          </Section>

          <Section title={t("images")}>
            <GalleryVariantsFields
              variants={asArray<ProductGalleryVariant>(form.galleryVariants)}
              onChange={(galleryVariants) => update("galleryVariants", galleryVariants)}
            />
          </Section>

          <Section title={tp("viewer3d")}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="3D model">
                <FileUploadField
                  value={form.modelUrl ?? ""}
                  accept=".glb,.gltf,.usdz,model/gltf-binary"
                  label={t("upload")}
                  onChange={(modelUrl) => update("modelUrl", modelUrl)}
                />
                <p className="mt-2 text-xs text-muted-foreground">{t("modelUrlHint")}</p>
              </Field>
              <Field label="Video">
                <FileUploadField
                  value={form.videoUrl ?? ""}
                  accept="video/*,.mp4,.webm"
                  label={t("upload")}
                  onChange={(videoUrl) => update("videoUrl", videoUrl)}
                />
              </Field>
            </div>

            <div className="mt-8 space-y-4 border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground">{t("colors")}</h3>
              <div className="space-y-6">
                {form.colors.map((color, index) => (
                  <div key={color.id} className="space-y-3 rounded-xl border border-border p-4">
                    <LocalizedInputs
                      label={t("name")}
                      value={color.name}
                      onChange={(name) => {
                        const colors = [...form.colors];
                        colors[index] = { ...color, name };
                        update("colors", colors);
                      }}
                    />
                    <div className="flex items-end gap-3">
                      <div
                        className="h-10 w-10 shrink-0 rounded-[5px] border border-border shadow-inner"
                        style={{ backgroundColor: color.hex || "#ffffff" }}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <Field label="HEX">
                          <Input
                            value={color.hex}
                            onChange={(e) => {
                              const colors = [...form.colors];
                              colors[index] = { ...color, hex: e.target.value };
                              update("colors", colors);
                            }}
                            className={adminFieldClass}
                          />
                        </Field>
                      </div>
                      <input
                        type="color"
                        value={color.hex || "#ffffff"}
                        onChange={(e) => {
                          const colors = [...form.colors];
                          colors[index] = { ...color, hex: e.target.value };
                          update("colors", colors);
                        }}
                        className="h-10 w-10 shrink-0 cursor-pointer rounded-[5px] border border-border bg-transparent p-1"
                        aria-label="HEX"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-muted-foreground hover:text-red-600"
                        onClick={() =>
                          update(
                            "colors",
                            form.colors.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 />
                        {t("delete")}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-border text-foreground"
                  onClick={() => update("colors", [...form.colors, emptyColor()])}
                >
                  <Plus />
                  {t("addColor")}
                </Button>
              </div>
            </div>
          </Section>

          <Section title={t("textures")}>
            <div className="space-y-6">
              {form.textures.map((texture, index) => (
                <div key={texture.id} className="space-y-3 rounded-xl border border-border p-4">
                  <LocalizedInputs
                    label={t("name")}
                    value={texture.name}
                    onChange={(name) => {
                      const textures = [...form.textures];
                      textures[index] = { ...texture, name };
                      update("textures", textures);
                    }}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Map URL">
                      <FileUploadField
                        value={texture.mapUrl}
                        accept="image/*"
                        label={t("upload")}
                        onChange={(mapUrl) => {
                          const textures = [...form.textures];
                          textures[index] = { ...texture, mapUrl };
                          update("textures", textures);
                        }}
                      />
                    </Field>
                    <Field label="Preview URL">
                      <FileUploadField
                        value={texture.previewUrl}
                        accept="image/*"
                        label={t("upload")}
                        onChange={(previewUrl) => {
                          const textures = [...form.textures];
                          textures[index] = { ...texture, previewUrl };
                          update("textures", textures);
                        }}
                      />
                    </Field>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-600"
                    onClick={() =>
                      update(
                        "textures",
                        form.textures.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 />
                    {t("delete")}
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border text-foreground"
                onClick={() => update("textures", [...form.textures, emptyTexture()])}
              >
                <Plus />
                {t("addTexture")}
              </Button>
            </div>
          </Section>

          <Section title={tp("specs")}>
            <div className="space-y-6">
              {form.specs.map((spec, index) => (
                <div key={spec.key} className="space-y-3 rounded-xl border border-border p-4">
                  <LocalizedInputs
                    label={t("name")}
                    value={spec.label}
                    onChange={(specLabel) => {
                      const specs = [...form.specs];
                      specs[index] = { ...spec, label: specLabel };
                      update("specs", specs);
                    }}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={t("value")}>
                      <Input
                        value={spec.value}
                        onChange={(e) => {
                          const specs = [...form.specs];
                          specs[index] = { ...spec, value: e.target.value };
                          update("specs", specs);
                        }}
                        className={adminFieldClass}
                      />
                    </Field>
                    <Field label={t("unit")}>
                      <Input
                        value={spec.unit ?? ""}
                        onChange={(e) => {
                          const specs = [...form.specs];
                          specs[index] = { ...spec, unit: e.target.value };
                          update("specs", specs);
                        }}
                        className={adminFieldClass}
                      />
                    </Field>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-600"
                    onClick={() =>
                      update(
                        "specs",
                        form.specs.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 />
                    {t("delete")}
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border text-foreground"
                onClick={() => update("specs", [...form.specs, emptySpec()])}
              >
                <Plus />
                {t("addSpec")}
              </Button>
            </div>
          </Section>

          <Section title={t("downloads")}>
            <div className="space-y-6">
              {form.downloads.map((file, index) => (
                <div key={file.id} className="space-y-3 rounded-xl border border-border p-4">
                  <LocalizedInputs
                    label={t("name")}
                    value={file.label}
                    onChange={(fileLabel) => {
                      const downloads = [...form.downloads];
                      downloads[index] = { ...file, label: fileLabel };
                      update("downloads", downloads);
                    }}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label={label("fileType", "File type")}>
                      <AdminSelect
                        value={file.type}
                        onValueChange={(type) => {
                          const downloads = [...form.downloads];
                          downloads[index] = {
                            ...file,
                            type: type as ProductDownload["type"],
                          };
                          update("downloads", downloads);
                        }}
                        placeholder="PDF"
                        options={[
                          { value: "pdf", label: "PDF" },
                          { value: "dwg", label: "DWG" },
                          { value: "bim", label: "BIM" },
                          { value: "3ds", label: "3DS" },
                          { value: "sketchup", label: "SketchUp" },
                          { value: "texture", label: "Texture" },
                          { value: "guide", label: "Guide" },
                        ]}
                      />
                    </Field>
                    <Field label={label("fileSize", "File size")}>
                      <Input
                        value={file.size ?? ""}
                        onChange={(e) => {
                          const downloads = [...form.downloads];
                          downloads[index] = { ...file, size: e.target.value };
                          update("downloads", downloads);
                        }}
                        className={adminFieldClass}
                        placeholder="1.2 MB"
                      />
                    </Field>
                  </div>
                  <FileUploadField
                    value={file.url}
                    accept=".pdf,.dwg,.zip,.doc,.docx,.skp,.ifc,.rfa,.3ds"
                    label={t("upload")}
                    onChange={(url, uploaded) => {
                      const downloads = [...form.downloads];
                      downloads[index] = {
                        ...file,
                        url,
                        size: uploaded ? formatBytes(uploaded.size) : file.size,
                        label: file.label.en.trim()
                          ? file.label
                          : {
                              en: uploaded?.name ?? file.label.en,
                              ru: file.label.ru,
                              am: file.label.am,
                            },
                      };
                      update("downloads", downloads);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-600"
                    onClick={() =>
                      update(
                        "downloads",
                        form.downloads.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Trash2 />
                    {t("delete")}
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-border text-foreground"
                onClick={() => update("downloads", [...form.downloads, emptyDownload()])}
              >
                <Plus />
                {label("addDownload", "Add download")}
              </Button>
            </div>
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

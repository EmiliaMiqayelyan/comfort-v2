"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Field } from "@/features/admin/form-ui";
import { FileUploadField } from "@/features/admin/file-upload";
import { emptyGalleryVariant, moveArrayItem } from "@/features/admin/catalog-form-utils";
import type { ProductGalleryVariant } from "@/types";

export function GalleryVariantsFields({
  variants,
  onChange,
}: {
  variants: ProductGalleryVariant[];
  onChange: (variants: ProductGalleryVariant[]) => void;
}) {
  const t = useTranslations("admin");
  const label = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const items = variants.length > 0 ? variants : [emptyGalleryVariant()];

  return (
    <div className="space-y-4">
      {items.map((variant, index) => (
        <div key={variant.id} className="space-y-3 rounded-xl border border-border p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={label("galleryVariantImage", "Մեծ նկար")} required>
              <FileUploadField
                value={variant.imageUrl ?? ""}
                accept="image/*"
                label={t("upload")}
                onChange={(imageUrl) => {
                  const next = [...items];
                  next[index] = { ...variant, imageUrl };
                  onChange(next);
                }}
              />
            </Field>
            <Field label={label("galleryVariantThumb", "Փոքր նկար")} required>
              <FileUploadField
                value={variant.thumbUrl ?? ""}
                accept="image/*"
                label={t("upload")}
                onChange={(thumbUrl) => {
                  const next = [...items];
                  next[index] = { ...variant, thumbUrl };
                  onChange(next);
                }}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              disabled={index === 0}
              aria-label={label("moveUp", "Move up")}
              onClick={() => onChange(moveArrayItem(items, index, index - 1))}
            >
              <ChevronUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              disabled={index >= items.length - 1}
              aria-label={label("moveDown", "Move down")}
              onClick={() => onChange(moveArrayItem(items, index, index + 1))}
            >
              <ChevronDown />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-red-600"
              disabled={items.length <= 1}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
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
        onClick={() => onChange([...items, emptyGalleryVariant()])}
      >
        <Plus />
        {t("addImage")}
      </Button>
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import { ProductViewer3D } from "@/features/viewer/product-viewer-3d";
import { Badge } from "@/components/atoms/badge";
import { Reveal } from "@/components/molecules/reveal";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { cn, formatPrice, mediaList, mediaSrc, jsonArray } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import { useCategories, useCollections, useProducts } from "@/hooks/use-catalog";
import type { Product, ProductColor, ProductDownload, ProductGalleryVariant, ProductSpec } from "@/types";

const DESCRIPTION_PREVIEW_CHARS = 130;

function buildDescriptionPreview(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= DESCRIPTION_PREVIEW_CHARS) {
    return { preview: normalized, isLong: false };
  }

  const slice = normalized.slice(0, DESCRIPTION_PREVIEW_CHARS);
  const breakAt = Math.max(
    slice.lastIndexOf(" "),
    slice.lastIndexOf("։"),
    slice.lastIndexOf("."),
  );
  const cut = breakAt > DESCRIPTION_PREVIEW_CHARS * 0.45 ? slice.slice(0, breakAt) : slice;

  return {
    preview: `${cut.trimEnd()}…`,
    isLong: true,
  };
}

export function ProductDetailContent({ product }: { product: Product }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const galleryVariants = jsonArray<ProductGalleryVariant>(product.galleryVariants);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () => galleryVariants[0]?.id ?? null,
  );
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const specs = jsonArray<ProductSpec>(product.specs);
  const downloads = jsonArray<ProductDownload>(product.downloads);
  const productColors = jsonArray<ProductColor>(product.colors);
  const viewerColors = productColors.filter((color) => color.hex?.trim());
  const selectedVariant =
    galleryVariants.find((variant) => variant.id === selectedVariantId) ?? galleryVariants[0];
  const activeSrc = useMemo(() => {
    if (selectedVariant?.imageUrl?.trim() || selectedVariant?.thumbUrl?.trim()) {
      return mediaSrc(selectedVariant.imageUrl?.trim() || selectedVariant.thumbUrl);
    }
    const fallback = mediaList(product.images)[0];
    return mediaSrc(fallback);
  }, [selectedVariant, product.images]);
  const isUpload = activeSrc.includes("/uploads/");
  const isRemote = /^https?:\/\//i.test(activeSrc);
  const variantsLabel = t.has("variants")
    ? t("variants")
    : locale === "am"
      ? "Տարբերակներ"
      : locale === "ru"
        ? "Варианты"
        : "Variants";
  const description = getLocalized(product.description, locale).trim();
  const { preview: descriptionPreview, isLong: isLongDescription } = useMemo(
    () => buildDescriptionPreview(description),
    [description],
  );
  const seeMoreLabel = t.has("seeMore")
    ? t("seeMore")
    : locale === "am"
      ? "Տեսնել ավելին"
      : locale === "ru"
        ? "Показать больше"
        : "See more";
  const seeLessLabel = t.has("seeLess")
    ? t("seeLess")
    : locale === "am"
      ? "Պակաս"
      : locale === "ru"
        ? "Скрыть"
        : "Show less";

  useEffect(() => {
    setDescriptionExpanded(false);
    const firstId = jsonArray<ProductGalleryVariant>(product.galleryVariants)[0]?.id ?? null;
    setSelectedVariantId(firstId);
    // Reset selection when navigating to another product
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();
  const { data: allProducts = [] } = useProducts();
  const category = categories.find((c) => c.id === product.categoryId);
  const collection = collections.find((c) => c.id === product.collectionId);
  const related = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categoryId === product.categoryId || p.collectionId === product.collectionId),
    )
    .slice(0, 4);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:gap-x-16 lg:gap-y-6">
        <div>
          <Reveal>
            <div className="space-y-3">
              <div className="catalog-panel catalog-shadow overflow-hidden rounded-[5px] border">
                <div className="relative aspect-[4/3] bg-[#ecece8]">
                  <Image
                    key={activeSrc}
                    src={activeSrc}
                    alt={getLocalized(product.name, locale)}
                    fill
                    quality={95}
                    unoptimized={isRemote || isUpload}
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {galleryVariants.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">{variantsLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {galleryVariants.map((variant) => {
                      const label = getLocalized(variant.name, locale) || getLocalized(product.name, locale);
                      const thumb = mediaSrc(variant.thumbUrl || variant.imageUrl);
                      const isSelected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          title={label}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={cn(
                            "relative h-16 w-16 shrink-0 overflow-hidden rounded-[5px] border-2 bg-[#ecece8] transition",
                            isSelected
                              ? "border-foreground shadow-sm"
                              : "border-border opacity-80 hover:border-foreground/40 hover:opacity-100",
                          )}
                          aria-pressed={isSelected}
                          aria-label={label}
                        >
                          <Image
                            src={thumb}
                            alt={label}
                            fill
                            unoptimized={
                              thumb.includes("/uploads/") || thumb.startsWith("http")
                            }
                            className="object-cover"
                            sizes="64px"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="space-y-10 lg:col-start-2 lg:row-span-2">
          <Reveal>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {category && <Badge>{getLocalized(category.name, locale)}</Badge>}
                {collection && <Badge>{getLocalized(collection.name, locale)}</Badge>}
              </div>
              <h1 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
                {getLocalized(product.name, locale)}
              </h1>
              {description && (
                <div className="text-lg leading-relaxed text-muted-foreground">
                  {!descriptionExpanded && isLongDescription ? (
                    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span>{descriptionPreview.replace(/…$/, "").trimEnd()}…</span>
                      <button
                        type="button"
                        onClick={() => setDescriptionExpanded(true)}
                        className="shrink-0 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent/80"
                      >
                        {seeMoreLabel}
                      </button>
                    </span>
                  ) : (
                    <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span>{description}</span>
                      {isLongDescription && (
                        <button
                          type="button"
                          onClick={() => setDescriptionExpanded(false)}
                          className="shrink-0 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent/80"
                        >
                          {seeLessLabel}
                        </button>
                      )}
                    </span>
                  )}
                </div>
              )}
              <p className="display text-2xl text-foreground">
                {formatPrice(product.price, locale)}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
                {t("specs")}
              </h2>
              <dl className="catalog-panel divide-y divide-border rounded-[5px] border">
                {specs.map((spec) => (
                  <div
                    key={spec.key}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {getLocalized(spec.label, locale)}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {spec.value}
                      {spec.unit ? ` ${spec.unit}` : ""}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <dt className="text-sm text-muted-foreground">{t("material")}</dt>
                  <dd className="text-sm font-medium text-foreground">{product.material}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <dt className="text-sm text-muted-foreground">{t("finish")}</dt>
                  <dd className="text-sm font-medium text-foreground">{product.finish}</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          {downloads.length > 0 && (
            <Reveal delay={0.2}>
              <div>
                <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
                  {t("downloads")}
                </h2>
                <ul className="space-y-3">
                  {downloads.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.url}
                        download
                        className="catalog-panel catalog-shadow group flex items-center gap-4 rounded-[5px] border px-5 py-4 transition hover:border-foreground/30"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {file.type === "pdf" ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {getLocalized(file.label, locale)}
                          </span>
                          {file.size && (
                            <span className="text-xs text-muted-foreground">{file.size}</span>
                          )}
                        </span>
                        <Badge>{file.type.toUpperCase()}</Badge>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <Reveal delay={0.15}>
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                {t("viewer3d")}
              </p>
              <ProductViewer3D
                key={product.id}
                modelUrl={product.modelUrl}
                colors={viewerColors}
                height={product.height}
                depth={product.depth}
              />
            </div>
          </Reveal>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-border pt-24">
          <Reveal>
            <h2 className="display mb-12 text-2xl text-foreground md:text-3xl">
              {t("related")}
            </h2>
          </Reveal>
          <ProductCardGrid products={related} />
        </section>
      )}
    </>
  );
}

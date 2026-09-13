"use client";

import { useMemo, useState, useEffect, type ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Download, Expand, FileText } from "lucide-react";
import { ProductViewer3D } from "@/features/viewer/product-viewer-3d";
import { Badge } from "@/components/atoms/badge";
import { ImageLightbox } from "@/components/molecules/image-lightbox";
import { Reveal } from "@/components/molecules/reveal";
import { isValidModelUrl } from "@/lib/product-model";
import { cn, formatPrice, mediaList, mediaSrc, jsonArray } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import type {
  LocalizedString,
  ProductColor,
  ProductDownload,
  ProductGalleryVariant,
  ProductSpec,
} from "@/types";

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

export type CatalogDetailItem = {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  images: string[];
  galleryVariants?: ProductGalleryVariant[];
  colors: ProductColor[];
  specs: ProductSpec[];
  downloads: ProductDownload[];
  material: string;
  finish: string;
  modelUrl?: string;
  height: number;
  width: number;
  depth: number;
  length: number;
};

export function CatalogDetailContent({
  item,
  badges,
  footer,
}: {
  item: CatalogDetailItem;
  badges?: ReactNode;
  footer?: ReactNode;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const galleryVariants = jsonArray<ProductGalleryVariant>(item.galleryVariants);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () => galleryVariants[0]?.id ?? null,
  );
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const specs = jsonArray<ProductSpec>(item.specs);
  const downloads = jsonArray<ProductDownload>(item.downloads);
  const productColors = jsonArray<ProductColor>(item.colors);
  const viewerColors = productColors.filter((color) => color.hex?.trim());
  const selectedVariant =
    galleryVariants.find((variant) => variant.id === selectedVariantId) ?? galleryVariants[0];
  const activeSrc = useMemo(() => {
    if (selectedVariant?.imageUrl?.trim() || selectedVariant?.thumbUrl?.trim()) {
      return mediaSrc(selectedVariant.imageUrl?.trim() || selectedVariant.thumbUrl);
    }
    const fallback = mediaList(item.images)[0];
    return mediaSrc(fallback);
  }, [selectedVariant, item.images]);
  const isUpload = activeSrc.includes("/uploads/");
  const isRemote = /^https?:\/\//i.test(activeSrc);
  const baseTitle = getLocalized(item.name, locale);
  const selectedVariantName = selectedVariant
    ? getLocalized(selectedVariant.name, locale).trim()
    : "";
  const displayTitle = selectedVariantName
    ? `${baseTitle} - ${selectedVariantName}`
    : baseTitle;
  const colorLabel = t.has("galleryColors")
    ? t("galleryColors")
    : t.has("colors")
      ? t("colors")
      : locale === "am"
        ? "Գույն"
        : locale === "ru"
          ? "Цвет"
          : "Color";
  const variantsHeading = selectedVariantName
    ? `${colorLabel}: ${selectedVariantName}`
    : colorLabel;
  const description = getLocalized(item.description, locale).trim();
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
      ? "Փակել"
      : locale === "ru"
        ? "Скрыть"
        : "Show less";
  const openImageLabel =
    locale === "am"
      ? `Բացել լրիվ էկրանով - ${displayTitle}`
      : locale === "ru"
        ? `Открыть на весь экран - ${displayTitle}`
        : `Open fullscreen - ${displayTitle}`;
  const closeLabel =
    locale === "am" ? "Փակել" : locale === "ru" ? "Закрыть" : "Close";
  const zoomInLabel =
    locale === "am" ? "Մեծացնել" : locale === "ru" ? "Увеличить" : "Zoom in";
  const zoomOutLabel =
    locale === "am" ? "Փոքրացնել" : locale === "ru" ? "Уменьшить" : "Zoom out";

  useEffect(() => {
    setDescriptionExpanded(false);
    setLightboxOpen(false);
    const firstId = jsonArray<ProductGalleryVariant>(item.galleryVariants)[0]?.id ?? null;
    setSelectedVariantId(firstId);
  }, [item.id, item.galleryVariants]);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_auto] lg:gap-x-16 lg:gap-y-6">
        <div>
          <Reveal>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[5px] bg-white text-left outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/40"
                aria-label={openImageLabel}
              >
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div
                    key={activeSrc}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeSrc}
                      alt={displayTitle}
                      fill
                      quality={95}
                      unoptimized={isRemote || isUpload}
                      className="object-contain object-center transition duration-300 group-hover:scale-[1.01]"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
                <span className="pointer-events-none absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Expand className="h-4 w-4" aria-hidden />
                </span>
              </button>

              {galleryVariants.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">
                    {variantsHeading}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {galleryVariants.map((variant) => {
                      const label =
                        getLocalized(variant.name, locale).trim() || baseTitle;
                      const thumb = mediaSrc(variant.thumbUrl || variant.imageUrl);
                      const isSelected = selectedVariant?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          title={label}
                          onClick={() => setSelectedVariantId(variant.id)}
                          className={cn(
                            "relative h-12 w-12 shrink-0 overflow-hidden rounded-[3px] bg-muted ring-2 ring-offset-1 ring-offset-background transition sm:h-14 sm:w-14",
                            isSelected
                              ? "ring-foreground"
                              : "ring-transparent opacity-90 hover:ring-foreground/25 hover:opacity-100",
                          )}
                          aria-pressed={isSelected}
                          aria-label={label}
                        >
                          <Image
                            src={thumb}
                            alt={label}
                            fill
                            unoptimized={thumb.includes("/uploads/") || thumb.startsWith("http")}
                            className="scale-125 object-cover object-center"
                            sizes="56px"
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
              {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
              <h1 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
                {displayTitle}
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
                {formatPrice(item.price, locale)}
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
                {(
                  [
                    { key: "height", label: t("height"), value: item.height },
                    { key: "width", label: t("width"), value: item.width },
                    { key: "depth", label: t("depth"), value: item.depth },
                    { key: "length", label: t("length"), value: item.length },
                  ] as const
                )
                  .filter((row) => Number(row.value) > 0)
                  .map((row) => (
                    <div
                      key={row.key}
                      className="flex items-center justify-between gap-4 px-6 py-4"
                    >
                      <dt className="text-sm text-muted-foreground">{row.label}</dt>
                      <dd className="text-sm font-medium text-foreground">
                        {Number(row.value)} mm
                      </dd>
                    </div>
                  ))}
                {item.material ? (
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <dt className="text-sm text-muted-foreground">{t("material")}</dt>
                    <dd className="text-sm font-medium text-foreground">{item.material}</dd>
                  </div>
                ) : null}
                {item.finish ? (
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <dt className="text-sm text-muted-foreground">{t("finish")}</dt>
                    <dd className="text-sm font-medium text-foreground">{item.finish}</dd>
                  </div>
                ) : null}
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

        {isValidModelUrl(item.modelUrl) ? (
          <div className="lg:col-start-1 lg:row-start-2">
            <Reveal delay={0.15}>
              <div>
                <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                  {t("viewer3d")}
                </p>
                <ProductViewer3D
                  key={item.id}
                  modelUrl={item.modelUrl}
                  colors={viewerColors}
                  height={item.height}
                  depth={item.depth}
                />
              </div>
            </Reveal>
          </div>
        ) : null}
      </div>

      {footer}

      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        src={activeSrc}
        alt={displayTitle}
        unoptimized={isRemote || isUpload}
        closeLabel={closeLabel}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </>
  );
}

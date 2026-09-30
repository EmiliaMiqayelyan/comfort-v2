"use client";

import {
  Suspense,
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Download, Expand, FileText } from "lucide-react";
import { ProductViewer3D } from "@/features/viewer/product-viewer-3d";
import { Badge } from "@/components/atoms/badge";
import { ImageLightbox } from "@/components/molecules/image-lightbox";
import { Reveal } from "@/components/molecules/reveal";
import { ProductOptionSelectors } from "@/features/products/product-option-selectors";
import { isValidModelUrl } from "@/lib/product-model";
import {
  defaultVariantSelection,
  findVariantBySelection,
} from "@/lib/product-variants";
import { cn, FALLBACK_MEDIA, formatPrice, mediaList, mediaSrc, jsonArray } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import type {
  LocalizedString,
  ProductColor,
  ProductDownload,
  ProductGalleryVariant,
  ProductOption,
  ProductSpec,
  ProductVariant,
} from "@/types";

function ProductPageTitle({ title }: { title: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.display = "";
      el.style.webkitLineClamp = "";
      el.style.webkitBoxOrient = "";
      el.style.fontSize = "";

      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!desktop) return;

      const maxPx = Number.parseFloat(getComputedStyle(el).fontSize);
      if (!Number.isFinite(maxPx) || maxPx <= 0) return;

      // Slot height matches one line at the large size. Shrink until the
      // full title fits there, so the color swatches stay put.
      const minPx = maxPx * 0.5;
      const overflows = () => el.scrollHeight > el.clientHeight + 2;

      if (!overflows()) return;

      let low = minPx;
      let high = maxPx;
      let best = minPx;
      for (let step = 0; step < 12; step += 1) {
        const mid = (low + high) / 2;
        el.style.fontSize = `${mid}px`;
        if (overflows()) high = mid;
        else {
          best = mid;
          low = mid;
        }
      }

      el.style.fontSize = `${best}px`;
      if (!overflows()) return;

      el.style.display = "-webkit-box";
      el.style.webkitBoxOrient = "vertical";
      el.style.webkitLineClamp = "2";
    };

    fit();
    const parent = el.parentElement;
    const observer =
      parent && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(fit)
        : null;
    observer?.observe(parent ?? el);

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    desktopQuery.addEventListener("change", fit);

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fit();
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      desktopQuery.removeEventListener("change", fit);
    };
  }, [title]);

  return (
    <h1
      ref={ref}
      title={title}
      className="display break-words leading-[1.15] text-[1.875rem] text-foreground max-lg:line-clamp-2 md:text-[2.25rem] lg:h-[calc(3rem*1.15+2px)] lg:overflow-hidden lg:text-[3rem]"
    >
      {title}
    </h1>
  );
}

function slideFromSrc(id: string, imageUrl: string, thumbUrl?: string | null) {
  const src = mediaSrc(imageUrl?.trim() || thumbUrl || "");
  return {
    id,
    src,
    thumb: mediaSrc(thumbUrl || imageUrl || ""),
    // Optimize same-origin /uploads via Next image pipeline; skip only
    // external absolute URLs and the brand fallback asset.
    unoptimized: src === FALLBACK_MEDIA || /^https?:\/\//i.test(src),
    isBrandFallback: src === FALLBACK_MEDIA,
  };
}

export type CatalogDetailItem = {
  id: string;
  sku?: string;
  name: LocalizedString;
  description: LocalizedString;
  price?: number | null;
  availability?: "in_stock" | "limited" | "preorder";
  images: string[];
  galleryVariants?: ProductGalleryVariant[];
  options?: ProductOption[];
  variants?: ProductVariant[];
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
  footer,
}: {
  item: CatalogDetailItem;
  footer?: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <CatalogDetailInner item={item} footer={footer} preferredVariantId={null} />
      }
    >
      <CatalogDetailWithSearch item={item} footer={footer} />
    </Suspense>
  );
}

function CatalogDetailWithSearch({
  item,
  footer,
}: {
  item: CatalogDetailItem;
  footer?: ReactNode;
}) {
  const searchParams = useSearchParams();
  return (
    <CatalogDetailInner
      item={item}
      footer={footer}
      preferredVariantId={searchParams.get("v")}
    />
  );
}

function CatalogDetailInner({
  item,
  footer,
  preferredVariantId,
}: {
  item: CatalogDetailItem;
  footer?: ReactNode;
  preferredVariantId: string | null;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const options = jsonArray<ProductOption>(item.options);
  const matrixVariants = jsonArray<ProductVariant>(item.variants);
  const hasMatrix = options.length > 0 && matrixVariants.length > 0;

  const galleryVariants = jsonArray<ProductGalleryVariant>(item.galleryVariants);
  const gallerySlides = useMemo(() => {
    if (hasMatrix) {
      return matrixVariants
        .map((variant) => {
          const imageUrl =
            variant.imageUrl?.trim() ||
            variant.thumbUrl?.trim() ||
            mediaList(variant.images)[0] ||
            "";
          if (!imageUrl) return null;
          return slideFromSrc(
            variant.id,
            imageUrl,
            variant.thumbUrl || imageUrl,
          );
        })
        .filter((slide): slide is NonNullable<typeof slide> => Boolean(slide));
    }

    const variants = jsonArray<ProductGalleryVariant>(item.galleryVariants);
    if (variants.length > 0) {
      return variants.map((variant) =>
        slideFromSrc(
          variant.id,
          variant.imageUrl?.trim() || variant.thumbUrl || "",
          variant.thumbUrl || variant.imageUrl,
        ),
      );
    }
    const fallback = mediaSrc(mediaList(item.images)[0]);
    if (!fallback) return [];
    return [slideFromSrc("default", fallback, fallback)];
  }, [hasMatrix, matrixVariants, item.galleryVariants, item.images]);

  const initialMatrix = useMemo(() => {
    if (!hasMatrix) {
      return {
        variant: null as ProductVariant | null,
        selectedByOptionId: {} as Record<string, string>,
      };
    }
    return defaultVariantSelection(options, matrixVariants, preferredVariantId);
    // Seed from URL / product identity only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, hasMatrix, preferredVariantId]);

  const [selectedByOptionId, setSelectedByOptionId] = useState<
    Record<string, string>
  >(() => initialMatrix.selectedByOptionId);
  const [activeMatrixVariant, setActiveMatrixVariant] = useState<ProductVariant | null>(
    () => initialMatrix.variant,
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    () =>
      hasMatrix
        ? initialMatrix.variant?.id ?? gallerySlides[0]?.id ?? null
        : gallerySlides[0]?.id ?? null,
  );
  const [displayedVariantId, setDisplayedVariantId] = useState<string | null>(
    () =>
      hasMatrix
        ? initialMatrix.variant?.id ?? gallerySlides[0]?.id ?? null
        : gallerySlides[0]?.id ?? null,
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const pendingIdRef = useRef<string | null>(null);
  const loadedSrcsRef = useRef<Set<string>>(new Set());

  const specs = jsonArray<ProductSpec>(item.specs);
  const downloads = jsonArray<ProductDownload>(item.downloads);
  const productColors = jsonArray<ProductColor>(item.colors);
  const viewerColors = productColors.filter((color) => color.hex?.trim());
  const selectedGalleryVariant =
    galleryVariants.find((variant) => variant.id === selectedVariantId) ??
    galleryVariants[0];
  const displayedSlide =
    gallerySlides.find((slide) => slide.id === displayedVariantId) ??
    gallerySlides[0];
  const activeSrc = displayedSlide?.src ?? "";
  const activeUnoptimized = displayedSlide?.unoptimized ?? false;
  const baseTitle = getLocalized(item.name, locale);
  const selectedVariantName = selectedGalleryVariant
    ? getLocalized(selectedGalleryVariant.name, locale).trim()
    : "";

  const matrixTitleSuffix = useMemo(() => {
    if (!hasMatrix) return "";
    const parts: string[] = [];
    for (const option of options) {
      const valueId = selectedByOptionId[option.id];
      const value = option.values.find((entry) => entry.id === valueId);
      if (!value) continue;
      const label =
        getLocalized(value.label, locale).trim() || value.value.trim();
      if (label) parts.push(label);
    }
    return parts.join(" · ");
  }, [hasMatrix, options, selectedByOptionId, locale]);

  const displayTitle = hasMatrix
    ? matrixTitleSuffix
      ? `${baseTitle} - ${matrixTitleSuffix}`
      : baseTitle
    : selectedVariantName && selectedVariantName.length <= 48
      ? `${baseTitle} - ${selectedVariantName}`
      : baseTitle;

  const activePrice =
    hasMatrix && activeMatrixVariant?.price != null
      ? Number(activeMatrixVariant.price)
      : item.price;
  const hasPrice =
    activePrice != null && Number.isFinite(Number(activePrice)) && Number(activePrice) > 0;

  const dimensionFromOptions = useMemo(() => {
    const result: Partial<
      Record<"height" | "width" | "depth" | "length", number>
    > = {};
    if (!hasMatrix) return result;
    for (const option of options) {
      const key = option.key.trim().toLowerCase();
      if (
        key !== "height" &&
        key !== "width" &&
        key !== "depth" &&
        key !== "length"
      ) {
        continue;
      }
      const valueId = selectedByOptionId[option.id];
      const value = option.values.find((entry) => entry.id === valueId);
      if (!value) continue;
      const parsed = Number.parseFloat(
        value.value.replace(",", ".").replace(/[^\d.-]/g, ""),
      );
      if (Number.isFinite(parsed) && parsed > 0) {
        result[key] = parsed;
      }
    }
    return result;
  }, [hasMatrix, options, selectedByOptionId]);

  const activeHeight =
    hasMatrix && activeMatrixVariant?.height != null
      ? Number(activeMatrixVariant.height)
      : (dimensionFromOptions.height ?? item.height);
  const activeWidth =
    hasMatrix && activeMatrixVariant?.width != null
      ? Number(activeMatrixVariant.width)
      : (dimensionFromOptions.width ?? item.width);
  const activeDepth =
    hasMatrix && activeMatrixVariant?.depth != null
      ? Number(activeMatrixVariant.depth)
      : (dimensionFromOptions.depth ?? item.depth);
  const activeLength =
    hasMatrix && activeMatrixVariant?.length != null
      ? Number(activeMatrixVariant.length)
      : (dimensionFromOptions.length ?? item.length);

  const orderedOptions = useMemo(() => {
    const swatches = options.filter((option) => option.uiType === "swatches");
    const buttons = options.filter((option) => option.uiType !== "swatches");
    return [...swatches, ...buttons];
  }, [options]);

  const description = getLocalized(item.description, locale).trim();
  const dimensionRows = (
    [
      { key: "height", label: t("height"), value: activeHeight },
      { key: "width", label: t("width"), value: activeWidth },
      { key: "depth", label: t("depth"), value: activeDepth },
      { key: "length", label: t("length"), value: activeLength },
    ] as const
  ).filter((row) => Number(row.value) > 0);
  const hasMaterial = Boolean(item.material?.trim());
  const hasFinish = Boolean(item.finish?.trim());
  const hasSpecs =
    specs.length > 0 || dimensionRows.length > 0 || hasMaterial || hasFinish;
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

  const selectSlide = (id: string) => {
    setSelectedVariantId(id);
    const slide = gallerySlides.find((entry) => entry.id === id);
    if (!slide || loadedSrcsRef.current.has(slide.src)) {
      pendingIdRef.current = null;
      setDisplayedVariantId(id);
      return;
    }
    pendingIdRef.current = id;
  };

  const handleSlideLoad = (id: string, src: string) => {
    loadedSrcsRef.current.add(src);
    if (pendingIdRef.current === id) {
      setDisplayedVariantId(id);
      pendingIdRef.current = null;
    }
  };

  const syncVariantUrl = (variantId: string | null) => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    if (variantId) params.set("v", variantId);
    else params.delete("v");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const applyMatrixSelection = (nextSelected: Record<string, string>) => {
    setSelectedByOptionId(nextSelected);
    const selectedIds = options
      .map((option) => nextSelected[option.id])
      .filter(Boolean);
    const matched =
      findVariantBySelection(matrixVariants, selectedIds) ??
      matrixVariants.find((variant) =>
        selectedIds.every((id) => variant.optionValueIds.includes(id)),
      ) ??
      null;
    setActiveMatrixVariant(matched);
    if (matched) {
      selectSlide(matched.id);
      syncVariantUrl(matched.id);
    }
  };

  useEffect(() => {
    setLightboxOpen(false);
    const seeded = hasMatrix
      ? defaultVariantSelection(options, matrixVariants, preferredVariantId)
      : {
          variant: null,
          selectedByOptionId: {},
        };
    setSelectedByOptionId(seeded.selectedByOptionId);
    setActiveMatrixVariant(seeded.variant);
    const firstId = hasMatrix
      ? seeded.variant?.id ?? gallerySlides[0]?.id ?? null
      : gallerySlides[0]?.id ?? null;
    setSelectedVariantId(firstId);
    setDisplayedVariantId(firstId);
    pendingIdRef.current = null;
    loadedSrcsRef.current = new Set();
    // Reset only when navigating to a different product.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[520px_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:gap-x-5 lg:gap-y-6">
        <div className="min-w-0">
          <Reveal>
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className={cn(
                "group relative aspect-square w-full max-w-[520px] cursor-zoom-in overflow-hidden rounded-[5px] text-left outline-none transition focus-visible:ring-2 focus-visible:ring-foreground/40 lg:size-[520px] lg:max-w-none",
                gallerySlides.some((slide) => slide.isBrandFallback) &&
                  "bg-[#ecece8]",
              )}
              aria-label={openImageLabel}
            >
              {gallerySlides.map((slide, index) => {
                const isSelected = slide.id === selectedVariantId;
                const isVisible =
                  isSelected || slide.id === displayedVariantId;
                return (
                  <div
                    key={slide.id}
                    className={cn(
                      "absolute inset-0",
                      isSelected ? "z-[1]" : "z-0",
                      isVisible ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden={!isSelected}
                  >
                    <Image
                      src={slide.src}
                      alt={displayTitle}
                      fill
                      quality={80}
                      unoptimized={slide.unoptimized}
                      priority={index === 0}
                      loading={index === 0 ? undefined : "eager"}
                      className={cn(
                        "object-contain object-left",
                        slide.isBrandFallback && "object-center p-[22%]",
                      )}
                      sizes="(max-width: 1024px) 100vw, 520px"
                      onLoad={() => handleSlideLoad(slide.id, slide.src)}
                    />
                  </div>
                );
              })}
              <span className="pointer-events-none absolute bottom-3 right-3 z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                <Expand className="h-4 w-4" aria-hidden />
              </span>
            </button>
          </Reveal>
        </div>

        <div className="space-y-6 lg:col-start-2 lg:row-span-2 lg:space-y-8">
          <Reveal>
            <div className="space-y-4">
              <ProductPageTitle title={displayTitle} />
              {hasPrice ? (
                <p className="display text-2xl text-foreground">
                  {formatPrice(Number(activePrice), locale)}
                </p>
              ) : null}
            </div>
          </Reveal>

          {!hasMatrix && galleryVariants.length > 0 ? (
            <Reveal delay={0.05}>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {galleryVariants.map((variant) => {
                  const label =
                    getLocalized(variant.name, locale).trim() || baseTitle;
                  const thumb = mediaSrc(variant.thumbUrl || variant.imageUrl);
                  const isSelected = selectedGalleryVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      title={label}
                      onClick={() => selectSlide(variant.id)}
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
                        unoptimized={
                          thumb.includes("/uploads/") || thumb.startsWith("http")
                        }
                        className="scale-125 object-cover object-center"
                        sizes="56px"
                      />
                    </button>
                  );
                })}
              </div>
            </Reveal>
          ) : null}

          {hasMatrix ? (
            <Reveal delay={0.05}>
              <ProductOptionSelectors
                options={orderedOptions}
                variants={matrixVariants}
                selectedByOptionId={selectedByOptionId}
                onSelect={(optionId, valueId) =>
                  applyMatrixSelection({
                    ...selectedByOptionId,
                    [optionId]: valueId,
                  })
                }
              />
            </Reveal>
          ) : null}

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
                  height={activeHeight}
                  depth={activeDepth}
                />
              </div>
            </Reveal>
          </div>
        ) : null}
      </div>

      {description || hasSpecs ? (
        <div
          className={cn(
            "mt-8 grid items-start gap-12",
            description && hasSpecs && "md:grid-cols-2 md:gap-x-10 lg:gap-x-16",
          )}
        >
          {description ? (
            <Reveal>
              <div>
                <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
                  {t("description")}
                </h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </Reveal>
          ) : null}

          {hasSpecs ? (
            <Reveal delay={0.1}>
              <div className={cn(!description && "max-w-3xl")}>
                <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
                  {t("specs")}
                </h2>
                <dl className="catalog-panel divide-y divide-border rounded-[5px] border">
                  {specs.map((spec) => (
                    <div
                      key={spec.key}
                      className="flex items-start justify-between gap-3 px-4 py-3.5 sm:items-center sm:gap-4 sm:px-6 sm:py-4"
                    >
                      <dt className="min-w-0 text-sm text-muted-foreground">
                        {getLocalized(spec.label, locale)}
                      </dt>
                      <dd className="shrink-0 text-right text-sm font-medium text-foreground">
                        {spec.value}
                        {spec.unit ? ` ${spec.unit}` : ""}
                      </dd>
                    </div>
                  ))}
                  {dimensionRows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-start justify-between gap-3 px-4 py-3.5 sm:items-center sm:gap-4 sm:px-6 sm:py-4"
                    >
                      <dt className="min-w-0 text-sm text-muted-foreground">{row.label}</dt>
                      <dd className="shrink-0 text-right text-sm font-medium text-foreground">
                        {Number(row.value)} mm
                      </dd>
                    </div>
                  ))}
                  {hasMaterial ? (
                    <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:items-center sm:gap-4 sm:px-6 sm:py-4">
                      <dt className="min-w-0 text-sm text-muted-foreground">{t("material")}</dt>
                      <dd className="shrink-0 text-right text-sm font-medium text-foreground">{item.material}</dd>
                    </div>
                  ) : null}
                  {hasFinish ? (
                    <div className="flex items-start justify-between gap-3 px-4 py-3.5 sm:items-center sm:gap-4 sm:px-6 sm:py-4">
                      <dt className="min-w-0 text-sm text-muted-foreground">{t("finish")}</dt>
                      <dd className="shrink-0 text-right text-sm font-medium text-foreground">{item.finish}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </Reveal>
          ) : null}
        </div>
      ) : null}

      {footer}

      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        src={activeSrc}
        alt={displayTitle}
        unoptimized={activeUnoptimized}
        closeLabel={closeLabel}
        zoomInLabel={zoomInLabel}
        zoomOutLabel={zoomOutLabel}
      />
    </>
  );
}

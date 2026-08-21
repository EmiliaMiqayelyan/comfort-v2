"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import html2canvas from "html2canvas";
import {
  Download,
  ImageIcon,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { getLocalized, roomPresets } from "@/data/catalog";
import { useCategories, useProducts } from "@/hooks/use-catalog";
import { productsInCategory } from "@/lib/category-tree";
import { useVisualizerStore } from "@/stores";

const LIGHTING_OPTIONS = [
  { id: "day", label: "Day" },
  { id: "evening", label: "Evening" },
  { id: "warm", label: "Warm" },
  { id: "cool", label: "Cool" },
] as const;

const FLOOR_OPTIONS = [
  { id: "oak", label: "Oak" },
  { id: "concrete", label: "Concrete" },
  { id: "marble", label: "Marble" },
];

export function RoomVisualizer({ className }: { className?: string }) {
  const t = useTranslations("visualizer");
  const locale = useLocale();
  const viewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  const {
    roomImage,
    presetId,
    baseboardId,
    panelId,
    moldingId,
    wallColor,
    floorId,
    lighting,
    showBefore,
    setField,
    reset,
  } = useVisualizerStore();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();

  const activePreset = useMemo(
    () => roomPresets.find((p) => p.id === presetId) ?? roomPresets[0],
    [presetId],
  );

  const displayImage = roomImage ?? activePreset.image;

  const categoryIdBySlug = (slug: string) =>
    categories.find((category) => category.slug === slug)?.id ?? "";

  const baseboardProducts = useMemo(
    () =>
      products.filter((product) =>
        productsInCategory(categoryIdBySlug("baseboards"), categories, product.categoryId),
      ),
    [categories, products],
  );
  const panelProducts = useMemo(
    () =>
      products.filter((product) =>
        productsInCategory(categoryIdBySlug("wall-panels"), categories, product.categoryId),
      ),
    [categories, products],
  );
  const moldingProducts = useMemo(
    () =>
      products.filter((product) =>
        productsInCategory(categoryIdBySlug("moldings"), categories, product.categoryId),
      ),
    [categories, products],
  );

  const lightingOverlay = useMemo(() => {
    switch (lighting) {
      case "evening":
        return "rgba(17,24,39,0.28)";
      case "warm":
        return "rgba(200,169,126,0.18)";
      case "cool":
        return "rgba(147,197,253,0.14)";
      default:
        return "transparent";
    }
  }, [lighting]);

  const handleUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setField("roomImage", reader.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [setField],
  );

  const handleExport = useCallback(async () => {
    if (!viewportRef.current) return;
    const canvas = await html2canvas(viewportRef.current, {
      useCORS: true,
      backgroundColor: null,
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "comfort-room-design.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const handleSave = useCallback(() => {
    const payload = {
      presetId,
      baseboardId,
      panelId,
      moldingId,
      wallColor,
      floorId,
      lighting,
    };
    localStorage.setItem("comfort-visualizer", JSON.stringify(payload));
  }, [
    baseboardId,
    floorId,
    lighting,
    moldingId,
    panelId,
    presetId,
    wallColor,
  ]);

  return (
    <section className={cn("container-wide py-10 lg:py-16", className)}>
      <header className="mb-10 max-w-2xl">
        <Badge className="mb-4 border-accent/30 bg-accent/10 text-accent">
          <Sparkles className="mr-1.5 size-3.5" aria-hidden />
          Comfort Studio
        </Badge>
        <h1 className="display text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div
            ref={viewportRef}
            className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft"
          >
            <Image
              src={displayImage}
              alt={getLocalized(activePreset.name, locale)}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                showBefore && "opacity-0",
              )}
              sizes="(max-width: 1280px) 100vw, 960px"
              unoptimized={displayImage.startsWith("data:")}
            />

            {showBefore && activePreset.image !== displayImage && (
              <Image
                src={activePreset.image}
                alt="Before"
                fill
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 960px"
              />
            )}

            <div
              className="pointer-events-none absolute inset-0 mix-blend-multiply"
              style={{ backgroundColor: wallColor }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 transition-colors duration-500"
              style={{ backgroundColor: lightingOverlay }}
              aria-hidden
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 sm:p-6">
              <div className="flex flex-wrap items-end gap-3">
                {baseboardId && (
                  <ProductChip
                    product={products.find((p) => p.id === baseboardId)}
                    locale={locale}
                    label={t("applyBaseboard")}
                  />
                )}
                {panelId && (
                  <ProductChip
                    product={products.find((p) => p.id === panelId)}
                    locale={locale}
                    label={t("applyPanels")}
                  />
                )}
                {moldingId && (
                  <ProductChip
                    product={products.find((p) => p.id === moldingId)}
                    locale={locale}
                    label={t("applyMoldings")}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={showBefore ? "accent" : "secondary"}
              onClick={() => setField("showBefore", !showBefore)}
              aria-pressed={showBefore}
            >
              {t("beforeAfter")}
            </Button>
            <Button type="button" variant="secondary" onClick={handleSave}>
              {t("save")}
            </Button>
            <Button type="button" variant="outline" onClick={handleShare}>
              <Share2 aria-hidden />
              {copied ? "Copied" : t("share")}
            </Button>
            <Button type="button" variant="accent" onClick={handleExport}>
              <Download aria-hidden />
              {t("export")}
            </Button>
          </div>
        </div>

        <aside className="glass space-y-6 rounded-3xl p-6 shadow-soft">
          <div className="space-y-3">
            <Label>{t("presets")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {roomPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  aria-pressed={presetId === preset.id}
                  onClick={() => {
                    setField("presetId", preset.id);
                    setField("roomImage", null);
                  }}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border-2 transition focus-ring",
                    presetId === preset.id
                      ? "border-accent ring-2 ring-accent/30"
                      : "border-transparent",
                  )}
                >
                  <Image
                    src={preset.image}
                    alt={getLocalized(preset.name, locale)}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-upload">{t("upload")}</Label>
            <input
              ref={fileInputRef}
              id="room-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload aria-hidden />
              {t("upload")}
            </Button>
          </div>

          <ProductStrip
            label={t("applyBaseboard")}
            products={baseboardProducts}
            selectedId={baseboardId}
            onSelect={(id) => setField("baseboardId", id)}
            locale={locale}
          />

          <ProductStrip
            label={t("applyPanels")}
            products={panelProducts}
            selectedId={panelId}
            onSelect={(id) => setField("panelId", id)}
            locale={locale}
          />

          <ProductStrip
            label={t("applyMoldings")}
            products={moldingProducts}
            selectedId={moldingId}
            onSelect={(id) => setField("moldingId", id)}
            locale={locale}
          />

          <div className="space-y-2">
            <Label htmlFor="wall-color">{t("wallColor")}</Label>
            <div className="flex items-center gap-3">
              <input
                id="wall-color"
                type="color"
                value={wallColor}
                onChange={(e) => setField("wallColor", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-xl border border-input bg-card focus-ring"
                aria-label={t("wallColor")}
              />
              <span className="text-sm text-muted-foreground">{wallColor}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor-select">{t("floor")}</Label>
            <select
              id="floor-select"
              value={floorId ?? ""}
              onChange={(e) => setField("floorId", e.target.value)}
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
              aria-label={t("floor")}
            >
              {FLOOR_OPTIONS.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lighting-select">{t("lighting")}</Label>
            <select
              id="lighting-select"
              value={lighting}
              onChange={(e) =>
                setField(
                  "lighting",
                  e.target.value as (typeof LIGHTING_OPTIONS)[number]["id"],
                )
              }
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
              aria-label={t("lighting")}
            >
              {LIGHTING_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </aside>
      </div>
    </section>
  );
}

function ProductStrip({
  label,
  products: items,
  selectedId,
  onSelect,
  locale,
}: {
  label: string;
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  locale: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          aria-pressed={selectedId === null}
          onClick={() => onSelect(null)}
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border text-xs text-muted-foreground focus-ring",
            selectedId === null
              ? "border-accent bg-accent/10"
              : "border-border bg-card/60",
          )}
        >
          <ImageIcon className="size-4" aria-hidden />
        </button>
        {items.map((product) => (
          <button
            key={product.id}
            type="button"
            aria-label={getLocalized(product.name, locale)}
            aria-pressed={selectedId === product.id}
            onClick={() => onSelect(product.id)}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 focus-ring",
              selectedId === product.id
                ? "border-accent ring-2 ring-accent/30"
                : "border-transparent",
            )}
          >
            <Image
              src={product.images[0]}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductChip({
  product,
  locale,
  label,
}: {
  product: Product | undefined;
  locale: string;
  label: string;
}) {
  if (!product) return null;
  return (
    <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-white">
      <span className="opacity-70">{label}</span>
      <span className="font-medium">
        {getLocalized(product.name, locale)}
      </span>
    </div>
  );
}

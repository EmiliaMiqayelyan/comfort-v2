"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import {
  Camera,
  Download,
  Expand,
  Layers,
  Maximize2,
  RotateCw,
  Ruler,
  Share2,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { AppSelect } from "@/components/molecules/app-select";
import { cn } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import { useViewerStore } from "@/stores";
import { resolveProductModelUrl } from "@/lib/product-model";
import { useTheme } from "next-themes";
import type { ProductColor } from "@/types";

const FALLBACK_COLOR_SWATCHES = [
  "#2C333E",
  "#203E4B",
  "#ACB9C0",
  "#E7DFD9",
];

const ENVIRONMENT_OPTIONS = [
  "apartment",
  "city",
  "warehouse",
  "sunset",
] as const;

const LIGHTING_OPTIONS = ["studio", "soft", "dramatic", "product"] as const;

export interface ProductViewer3DProps {
  modelUrl?: string;
  color?: string;
  colors?: ProductColor[];
  height?: number;
  depth?: number;
  className?: string;
}

function ViewerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/60 bg-muted/40",
        className,
      )}
      aria-hidden
    >
      <div className="absolute inset-0 skeleton" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
        <div className="h-9 w-32 rounded-full skeleton" />
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-full skeleton" />
          <div className="h-9 w-9 rounded-full skeleton" />
        </div>
      </div>
    </div>
  );
}

const ViewerCanvas = dynamic(
  () => import("./viewer-canvas").then((mod) => mod.ViewerCanvas),
  {
    ssr: false,
    loading: () => <ViewerSkeleton className="h-full w-full" />,
  },
);

export function ProductViewer3D({
  modelUrl,
  color: colorProp,
  colors,
  height = 80,
  depth = 16,
  className,
}: ProductViewer3DProps) {
  const t = useTranslations("viewer");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const canvasBackground = resolvedTheme === "dark" ? "#2C333E" : "#ffffff";
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    autoRotate,
    exploded,
    wireframe,
    showDimensions,
    color: storeColor,
    lighting,
    environment,
    set,
  } = useViewerStore();

  const activeColor = colorProp ?? storeColor;

  const palette = useMemo(() => {
    const fromProduct = (colors ?? [])
      .filter((item) => item.hex?.trim())
      .map((item) => ({
        hex: item.hex.trim(),
        label: getLocalized(item.name, locale) || item.hex.trim(),
      }));
    if (fromProduct.length > 0) return fromProduct;
    return FALLBACK_COLOR_SWATCHES.map((hex) => ({ hex, label: hex }));
  }, [colors, locale]);

  useEffect(() => {
    if (colorProp !== undefined) {
      set({ color: colorProp });
      return;
    }
    const first = palette[0]?.hex;
    if (!first) return;
    const hexes = palette.map((item) => item.hex.toLowerCase());
    if (!hexes.includes(storeColor.toLowerCase())) {
      set({ color: first });
    }
  }, [colorProp, palette, set, storeColor]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await el.requestFullscreen();
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "comfort-product.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleShare = useCallback(async () => {
    const payload = JSON.stringify({
      color: activeColor,
      autoRotate,
      exploded,
      wireframe,
      showDimensions,
      lighting,
      environment,
    });
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("title"),
          text: payload,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled share */
    }
  }, [
    activeColor,
    autoRotate,
    environment,
    exploded,
    lighting,
    showDimensions,
    t,
    wireframe,
  ]);

  const scale = useMemo(
    () => ({
      h: height / 80,
      d: depth / 16,
    }),
    [depth, height],
  );

  const lightingOptions = useMemo(
    () =>
      LIGHTING_OPTIONS.map((option) => ({
        value: option,
        label: t(`lightingOptions.${option}`),
      })),
    [t],
  );

  const environmentOptions = useMemo(
    () =>
      ENVIRONMENT_OPTIONS.map((option) => ({
        value: option,
        label: t(`environmentOptions.${option}`),
      })),
    [t],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "catalog-panel catalog-shadow relative w-full overflow-hidden rounded-3xl border",
        className,
        isFullscreen
          ? "h-full max-h-none rounded-none"
          : "h-[420px] max-h-[420px]",
        "fullscreen:h-full fullscreen:max-h-none fullscreen:rounded-none",
      )}
    >
      <div className="absolute inset-0">
        <Suspense fallback={<ViewerSkeleton className="h-full w-full" />}>
          <ViewerCanvas
            modelUrl={resolveProductModelUrl(modelUrl) ?? undefined}
            color={activeColor}
            scale={scale}
            autoRotate={autoRotate}
            exploded={exploded}
            wireframe={wireframe}
            showDimensions={showDimensions}
            lighting={lighting}
            environment={environment}
            heightMm={height}
            depthMm={depth}
            background={canvasBackground}
          />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-4">
        <div className="glass pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl p-2 shadow-soft">
          <ToolbarToggle
            pressed={autoRotate}
            onClick={() => set({ autoRotate: !autoRotate })}
            label={t("autoRotate")}
            icon={<RotateCw aria-hidden />}
          />
          <ToolbarToggle
            pressed={exploded}
            onClick={() => set({ exploded: !exploded })}
            label={t("exploded")}
            icon={<Layers aria-hidden />}
          />
          <ToolbarToggle
            pressed={wireframe}
            onClick={() => set({ wireframe: !wireframe })}
            label={t("wireframe")}
            icon={<Camera aria-hidden />}
          />
          <ToolbarToggle
            pressed={showDimensions}
            onClick={() => set({ showDimensions: !showDimensions })}
            label={t("dimensions")}
            icon={<Ruler aria-hidden />}
          />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
        <div className="glass pointer-events-auto rounded-[5px] p-3 shadow-soft">
          <div className="flex gap-4">
            <div className="w-[4.75rem] shrink-0">
              <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{t("color")}</p>
              <div
                className="grid w-[4.75rem] grid-cols-2 gap-2"
                role="group"
                aria-label={t("color")}
              >
                {palette.map((item) => (
                  <button
                    key={item.hex}
                    type="button"
                    aria-label={item.label}
                    aria-pressed={activeColor.toLowerCase() === item.hex.toLowerCase()}
                    title={item.label}
                    onClick={() => set({ color: item.hex })}
                    className={cn(
                      "box-border h-8 w-8 shrink-0 rounded-full border-2 shadow-sm transition focus-ring",
                      activeColor.toLowerCase() === item.hex.toLowerCase()
                        ? "border-foreground ring-2 ring-foreground/20"
                        : "border-white/70 hover:border-foreground/50",
                    )}
                    style={{ backgroundColor: item.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-end gap-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <AppSelect
                  value={lighting}
                  onValueChange={(value) =>
                    set({ lighting: value as (typeof LIGHTING_OPTIONS)[number] })
                  }
                  placeholder={t("lighting")}
                  options={lightingOptions}
                />
                <AppSelect
                  value={environment}
                  onValueChange={(value) =>
                    set({ environment: value as (typeof ENVIRONMENT_OPTIONS)[number] })
                  }
                  placeholder={t("environment")}
                  options={environmentOptions}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleFullscreen}
                  aria-label={t("fullscreen")}
                >
                  {isFullscreen ? <Maximize2 aria-hidden /> : <Expand aria-hidden />}
                  {t("fullscreen")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleScreenshot}
                  aria-label={t("screenshot")}
                >
                  <Download aria-hidden />
                  {t("screenshot")}
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  size="sm"
                  onClick={handleShare}
                  aria-label={t("share")}
                >
                  <Share2 aria-hidden />
                  {copied ? "Copied" : t("share")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarToggle({
  pressed,
  onClick,
  label,
  icon,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus-ring",
        pressed
          ? "bg-accent text-accent-foreground"
          : "bg-card/70 text-foreground hover:bg-muted",
      )}
    >
      {icon}
    </button>
  );
}

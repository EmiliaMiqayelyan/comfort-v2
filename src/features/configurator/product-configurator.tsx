"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bookmark, Share2, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Label } from "@/components/atoms/label";
import { cn, formatPrice } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import { useCollections, useProducts } from "@/hooks/use-catalog";
import { useConfiguratorStore } from "@/stores";
import { ProductViewer3D } from "@/features/viewer/product-viewer-3d";

const FINISH_OPTIONS = [
  { id: "matte", label: "Matte" },
  { id: "satin", label: "Satin" },
  { id: "gloss", label: "Gloss" },
];

const MATERIAL_OPTIONS = [
  { id: "hd-polymer", label: "HD Polymer" },
  { id: "mdf", label: "MDF" },
  { id: "aluminum", label: "Aluminum" },
];

const CORNER_OPTIONS = [
  { id: "corner-inner", labelKey: "inner" as const },
  { id: "corner-outer", labelKey: "outer" as const },
];

const CONNECTOR_OPTIONS = [
  { id: "connector-clip", labelKey: "clip" as const },
  { id: "connector-seam", labelKey: "seam" as const },
];

export function ProductConfigurator({ className }: { className?: string }) {
  const t = useTranslations("configurator");
  const tv = useTranslations("viewer");
  const locale = useLocale();
  const {
    collectionId,
    modelId,
    colorId,
    finishId,
    materialId,
    textureId,
    ledProfile,
    cornerAccessories,
    connectors,
    setField,
    toggleCorner,
    toggleConnector,
    reset,
  } = useConfiguratorStore();
  const { data: products = [] } = useProducts();
  const { data: collections = [] } = useCollections();

  useEffect(() => {
    if (!products.length) return;
    const current = products.find((product) => product.id === modelId);
    if (current) {
      if (!collectionId && current.collectionId) {
        setField("collectionId", current.collectionId);
      }
      return;
    }
    const fromCollection = collectionId
      ? products.find((product) => product.collectionId === collectionId)
      : undefined;
    const next = fromCollection ?? products[0];
    if (!next) return;
    setField("collectionId", next.collectionId || collectionId);
    setField("modelId", next.id);
  }, [collectionId, modelId, products, setField]);

  const collectionProducts = useMemo(
    () =>
      products.filter(
        (p) => !collectionId || p.collectionId === collectionId,
      ),
    [collectionId, products],
  );

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === modelId) ?? collectionProducts[0],
    [collectionProducts, modelId],
  );

  const selectedColor = useMemo(() => {
    const palette = selectedProduct?.colors ?? [];
    return palette.find((c) => c.id === colorId) ?? palette[0];
  }, [colorId, selectedProduct]);

  const summaryItems = useMemo(
    () => [
      {
        label: t("collection"),
        value: collections.find((c) => c.id === collectionId)
          ? getLocalized(
              collections.find((c) => c.id === collectionId)!.name,
              locale,
            )
          : "—",
      },
      {
        label: t("model"),
        value: selectedProduct
          ? getLocalized(selectedProduct.name, locale)
          : "—",
      },
      {
        label: t("color"),
        value: selectedColor
          ? getLocalized(selectedColor.name, locale)
          : "—",
      },
      {
        label: t("finish"),
        value:
          FINISH_OPTIONS.find((f) => f.id === finishId)?.label ?? finishId,
      },
      {
        label: t("material"),
        value:
          MATERIAL_OPTIONS.find((m) => m.id === materialId)?.label ??
          materialId,
      },
      {
        label: t("texture"),
        value: selectedProduct?.textures.find((tx) => tx.id === textureId)
          ? getLocalized(
              selectedProduct.textures.find((tx) => tx.id === textureId)!
                .name,
              locale,
            )
          : textureId,
      },
      {
        label: t("led"),
        value: ledProfile ? "On" : "Off",
      },
    ],
    [
      collectionId,
      finishId,
      ledProfile,
      locale,
      materialId,
      selectedColor,
      selectedProduct,
      t,
      textureId,
    ],
  );

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("collection", collectionId ?? "");
    url.searchParams.set("model", modelId ?? "");
    url.searchParams.set("color", colorId ?? "");
    await navigator.clipboard.writeText(url.toString());
  };

  const handleSave = () => {
    const payload = {
      collectionId,
      modelId,
      colorId,
      finishId,
      materialId,
      textureId,
      ledProfile,
      cornerAccessories,
      connectors,
    };
    localStorage.setItem("comfort-config", JSON.stringify(payload));
  };

  return (
    <section className={cn("container-wide py-10 lg:py-16", className)}>
      <header className="mb-10 max-w-2xl">
        <Badge className="mb-4 border-accent/30 bg-accent/10 text-accent">
          {tv("title")}
        </Badge>
        <h1 className="display text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] xl:gap-12">
        <aside className="glass space-y-6 rounded-3xl p-6 shadow-soft">
          <OptionGroup label={t("collection")}>
            <select
              id="config-collection"
              value={collectionId ?? ""}
              onChange={(e) => {
                const nextCollection = e.target.value;
                setField("collectionId", nextCollection);
                const firstModel = products.find(
                  (p) => p.collectionId === nextCollection,
                );
                if (firstModel) setField("modelId", firstModel.id);
              }}
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
              aria-label={t("collection")}
            >
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {getLocalized(collection.name, locale)}
                </option>
              ))}
            </select>
          </OptionGroup>

          <OptionGroup label={t("model")}>
            <select
              id="config-model"
              value={modelId ?? ""}
              onChange={(e) => setField("modelId", e.target.value)}
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
              aria-label={t("model")}
            >
              {collectionProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {getLocalized(product.name, locale)}
                </option>
              ))}
            </select>
          </OptionGroup>

          <OptionGroup label={t("color")}>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("color")}>
              {(selectedProduct?.colors ?? []).map((color) => (
                <button
                  key={color.id}
                  type="button"
                  aria-label={getLocalized(color.name, locale)}
                  aria-pressed={colorId === color.id}
                  onClick={() => setField("colorId", color.id)}
                  className={cn(
                    "h-10 w-10 rounded-full border-2 transition-transform hover:scale-105 focus-ring",
                    colorId === color.id
                      ? "border-accent ring-2 ring-accent/40"
                      : "border-white/70",
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </OptionGroup>

          <div className="grid gap-4 sm:grid-cols-2">
            <OptionGroup label={t("finish")}>
              <select
                id="config-finish"
                value={finishId ?? ""}
                onChange={(e) => setField("finishId", e.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
                aria-label={t("finish")}
              >
                {FINISH_OPTIONS.map((finish) => (
                  <option key={finish.id} value={finish.id}>
                    {finish.label}
                  </option>
                ))}
              </select>
            </OptionGroup>

            <OptionGroup label={t("material")}>
              <select
                id="config-material"
                value={materialId ?? ""}
                onChange={(e) => setField("materialId", e.target.value)}
                className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
                aria-label={t("material")}
              >
                {MATERIAL_OPTIONS.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.label}
                  </option>
                ))}
              </select>
            </OptionGroup>
          </div>

          <OptionGroup label={t("texture")}>
            <select
              id="config-texture"
              value={textureId ?? ""}
              onChange={(e) => setField("textureId", e.target.value)}
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
              aria-label={t("texture")}
            >
              {(selectedProduct?.textures ?? []).map((texture) => (
                <option key={texture.id} value={texture.id}>
                  {getLocalized(texture.name, locale)}
                </option>
              ))}
            </select>
          </OptionGroup>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 px-4 py-3">
            <span className="text-sm font-medium">{t("led")}</span>
            <input
              type="checkbox"
              role="switch"
              aria-label={t("led")}
              checked={ledProfile}
              onChange={(e) => setField("ledProfile", e.target.checked)}
              className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-muted transition checked:bg-accent focus-ring [&::after]:ml-0.5 [&::after]:block [&::after]:h-4 [&::after]:w-4 [&::after]:rounded-full [&::after]:bg-white [&::after]:transition checked:[&::after]:translate-x-4"
            />
          </label>

          <OptionGroup label={t("corners")}>
            <div className="space-y-2">
              {CORNER_OPTIONS.map((corner) => (
                <label
                  key={corner.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={cornerAccessories.includes(corner.id)}
                    onChange={() => toggleCorner(corner.id)}
                    className="size-4 rounded border-input accent-accent focus-ring"
                  />
                  <span className="text-sm capitalize">{corner.labelKey}</span>
                </label>
              ))}
            </div>
          </OptionGroup>

          <OptionGroup label={t("connectors")}>
            <div className="space-y-2">
              {CONNECTOR_OPTIONS.map((connector) => (
                <label
                  key={connector.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={connectors.includes(connector.id)}
                    onChange={() => toggleConnector(connector.id)}
                    className="size-4 rounded border-input accent-accent focus-ring"
                  />
                  <span className="text-sm capitalize">
                    {connector.labelKey}
                  </span>
                </label>
              ))}
            </div>
          </OptionGroup>

          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </aside>

        <div className="space-y-6">
          <ProductViewer3D
            modelUrl={selectedProduct?.modelUrl}
            colors={selectedProduct?.colors}
            color={selectedColor?.hex}
            height={selectedProduct?.height}
            depth={selectedProduct?.depth}
          />

          <div className="glass rounded-3xl p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="size-4 text-accent" aria-hidden />
              <h2 className="display text-xl">{t("summary")}</h2>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-border/70 bg-card/50 px-4 py-3"
                >
                  <dt className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>

            {selectedProduct && (
              <p className="mt-4 text-sm text-muted-foreground">
                From{" "}
                <span className="font-medium text-foreground">
                  {formatPrice(selectedProduct.price, locale)}
                </span>
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="secondary" onClick={handleSave}>
                <Bookmark aria-hidden />
                {t("save")}
              </Button>
              <Button type="button" variant="outline" onClick={handleShare}>
                <Share2 aria-hidden />
                {t("share")}
              </Button>
              <Button type="button" variant="accent" asChild>
                <Link href="/contact">{t("addQuote")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

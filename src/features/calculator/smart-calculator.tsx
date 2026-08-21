"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calculator, Download, Mail, Save } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Badge } from "@/components/atoms/badge";
import { cn, formatPrice } from "@/lib/utils";
import { calculateMaterials } from "@/lib/calculator";
import { saveCalculator } from "@/lib/api";
import { useProducts } from "@/hooks/use-catalog";
import { useCalculatorStore } from "@/stores";

const CORNER_TYPES = [
  { id: "standard", label: "Standard" },
  { id: "soft", label: "Soft radius" },
  { id: "sharp", label: "Sharp" },
];

export function SmartCalculator({ className }: { className?: string }) {
  const t = useTranslations("calculator");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { input, result, setInput, setResult } = useCalculatorStore();
  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (!products.length) return;
    if (!input.profileType || !products.some((product) => product.id === input.profileType)) {
      setInput("profileType", products[0].id);
    }
  }, [input.profileType, products, setInput]);

  const selectedProduct = products.find((product) => product.id === input.profileType) ?? products[0];

  const handleCalculate = useCallback(() => {
    setResult(calculateMaterials(input, selectedProduct?.price ?? 0));
  }, [input, selectedProduct, setResult]);

  const handlePdf = useCallback(() => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(t("title"), 20, 24);
    doc.setFontSize(11);
    doc.text(`${t("perimeter")}: ${input.perimeter} ${tc("meters")}`, 20, 40);
    doc.text(`${t("wallHeight")}: ${input.wallHeight} ${tc("meters")}`, 20, 48);
    doc.text(`${t("doors")}: ${input.doorCount}`, 20, 56);
    doc.text(`${t("windows")}: ${input.windowCount}`, 20, 64);
    doc.text(`${t("pieces")}: ${result.pieces}`, 20, 80);
    doc.text(`${t("connectors")}: ${result.connectors}`, 20, 88);
    doc.text(`${t("innerCorners")}: ${result.innerCorners}`, 20, 96);
    doc.text(`${t("outerCorners")}: ${result.outerCorners}`, 20, 104);
    doc.text(`${t("adhesiveAmount")}: ${result.adhesiveKg} ${tc("kg")}`, 20, 112);
    doc.text(
      `${t("estimatedPrice")}: ${formatPrice(result.estimatedPrice, locale)}`,
      20,
      128,
    );
    doc.save("comfort-calculation.pdf");
  }, [input, locale, result, t, tc]);

  const handleSave = useCallback(async () => {
    if (!result) return;
    try {
      await saveCalculator({ input, result });
    } catch {
      // Keep local result even if API is offline.
    }
  }, [input, result]);

  const emailHref = result
    ? `mailto:?subject=${encodeURIComponent(t("title"))}&body=${encodeURIComponent(
        [
          `${t("pieces")}: ${result.pieces}`,
          `${t("connectors")}: ${result.connectors}`,
          `${t("innerCorners")}: ${result.innerCorners}`,
          `${t("outerCorners")}: ${result.outerCorners}`,
          `${t("adhesiveAmount")}: ${result.adhesiveKg} ${tc("kg")}`,
          `${t("estimatedPrice")}: ${formatPrice(result.estimatedPrice, locale)}`,
        ].join("\n"),
      )}`
    : "#";

  return (
    <section className={cn("container-wide py-10 lg:py-16", className)}>
      <header className="mb-10 max-w-2xl">
        <Badge className="mb-4 border-accent/30 bg-accent/10 text-accent">
          <Calculator className="mr-1.5 size-3.5" aria-hidden />
          Comfort Tools
        </Badge>
        <h1 className="display text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,480px)_1fr] xl:gap-12">
        <form
          className="glass space-y-5 rounded-3xl p-6 shadow-soft"
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
        >
          <Field
            id="calc-perimeter"
            label={t("perimeter")}
            suffix={tc("meters")}
          >
            <Input
              id="calc-perimeter"
              type="number"
              min={0}
              step={0.1}
              value={input.perimeter}
              onChange={(e) =>
                setInput("perimeter", Number(e.target.value) || 0)
              }
              aria-label={t("perimeter")}
            />
          </Field>

          <Field
            id="calc-wall-height"
            label={t("wallHeight")}
            suffix={tc("meters")}
          >
            <Input
              id="calc-wall-height"
              type="number"
              min={0}
              step={0.1}
              value={input.wallHeight}
              onChange={(e) =>
                setInput("wallHeight", Number(e.target.value) || 0)
              }
              aria-label={t("wallHeight")}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="calc-doors" label={t("doors")}>
              <Input
                id="calc-doors"
                type="number"
                min={0}
                step={1}
                value={input.doorCount}
                onChange={(e) =>
                  setInput("doorCount", Number(e.target.value) || 0)
                }
                aria-label={t("doors")}
              />
            </Field>
            <Field id="calc-windows" label={t("windows")}>
              <Input
                id="calc-windows"
                type="number"
                min={0}
                step={1}
                value={input.windowCount}
                onChange={(e) =>
                  setInput("windowCount", Number(e.target.value) || 0)
                }
                aria-label={t("windows")}
              />
            </Field>
          </div>

          <Field id="calc-profile" label={t("profile")}>
            <select
              id="calc-profile"
              value={input.profileType}
              onChange={(e) => setInput("profileType", e.target.value)}
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
              aria-label={t("profile")}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku}
                </option>
              ))}
            </select>
          </Field>

          <Field id="calc-corner" label={t("corner")}>
            <select
              id="calc-corner"
              value={input.cornerType}
              onChange={(e) => setInput("cornerType", e.target.value)}
              className="h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm focus-ring"
              aria-label={t("corner")}
            >
              {CORNER_TYPES.map((corner) => (
                <option key={corner.id} value={corner.id}>
                  {corner.label}
                </option>
              ))}
            </select>
          </Field>

          <Field id="calc-waste" label={t("waste")}>
            <Input
              id="calc-waste"
              type="number"
              min={0}
              max={30}
              step={1}
              value={input.wastePercent}
              onChange={(e) =>
                setInput("wastePercent", Number(e.target.value) || 0)
              }
              aria-label={t("waste")}
            />
          </Field>

          <label className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 px-4 py-3">
            <span className="text-sm font-medium">{t("adhesive")}</span>
            <input
              type="checkbox"
              role="switch"
              aria-label={t("adhesive")}
              checked={input.includeAdhesive}
              onChange={(e) => setInput("includeAdhesive", e.target.checked)}
              className="h-5 w-9 cursor-pointer appearance-none rounded-full bg-muted transition checked:bg-accent focus-ring [&::after]:ml-0.5 [&::after]:block [&::after]:h-4 [&::after]:w-4 [&::after]:rounded-full [&::after]:bg-white [&::after]:transition checked:[&::after]:translate-x-4"
            />
          </label>

          <Button type="submit" variant="accent" size="lg" className="w-full">
            <Calculator aria-hidden />
            {t("calculate")}
          </Button>
        </form>

        <aside className="glass flex flex-col rounded-3xl p-6 shadow-soft">
          <h2 className="display mb-6 text-2xl">{t("results")}</h2>

          {result ? (
            <>
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <ResultItem label={t("pieces")} value={String(result.pieces)} />
                <ResultItem
                  label={t("connectors")}
                  value={String(result.connectors)}
                />
                <ResultItem
                  label={t("innerCorners")}
                  value={String(result.innerCorners)}
                />
                <ResultItem
                  label={t("outerCorners")}
                  value={String(result.outerCorners)}
                />
                <ResultItem
                  label={t("adhesiveAmount")}
                  value={`${result.adhesiveKg} ${tc("kg")}`}
                />
                <ResultItem
                  label={t("estimatedPrice")}
                  value={formatPrice(result.estimatedPrice, locale)}
                  highlight
                />
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Total length: {result.totalLength} {tc("meters")} · Waste:{" "}
                {result.wasteMeters} {tc("meters")}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={handlePdf}>
                  <Download aria-hidden />
                  {t("pdf")}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <a href={emailHref}>{t("email")}</a>
                </Button>
                <Button type="button" variant="ghost" onClick={handleSave}>
                  <Save aria-hidden />
                  {t("save")}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 px-6 py-16 text-center">
              <Calculator
                className="mb-4 size-10 text-muted-foreground/50"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                Enter your room dimensions and calculate material requirements.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  suffix,
  children,
}: {
  id: string;
  label: string;
  suffix?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center justify-between">
        <span>{label}</span>
        {suffix && (
          <span className="text-xs font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

function ResultItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-4",
        highlight
          ? "border-accent/40 bg-accent/10"
          : "border-border/70 bg-card/50",
      )}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-medium",
          highlight && "text-accent",
        )}
      >
        {value}
      </p>
    </div>
  );
}

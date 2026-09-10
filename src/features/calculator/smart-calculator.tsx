"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calculator, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { cn, formatPrice } from "@/lib/utils";
import { calculateMaterials } from "@/lib/calculator";
import { useProducts } from "@/hooks/use-catalog";
import { useCalculatorStore } from "@/stores";

const CORNER_TYPES = ["standard", "soft", "sharp"] as const;

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

  return (
    <section className={cn("container-wide py-10 lg:py-16", className)}>
      <header className="mb-10 max-w-2xl">
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
                <option key={corner} value={corner}>
                  {t(`cornerTypes.${corner}`)}
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

          <div
            role="presentation"
            className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-card/60 px-4 py-3"
            onClick={() => setInput("includeAdhesive", !input.includeAdhesive)}
          >
            <span id="calc-adhesive-label" className="text-sm font-medium">
              {t("adhesive")}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={input.includeAdhesive}
              aria-labelledby="calc-adhesive-label"
              onClick={(e) => {
                e.stopPropagation();
                setInput("includeAdhesive", !input.includeAdhesive);
              }}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-ring",
                input.includeAdhesive ? "bg-accent" : "bg-muted",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                  input.includeAdhesive && "translate-x-5",
                )}
              />
            </button>
          </div>

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

              <div className="mt-6">
                <Button type="button" variant="secondary" onClick={handlePdf}>
                  <Download aria-hidden />
                  {t("pdf")}
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
                {t("emptyHint")}
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

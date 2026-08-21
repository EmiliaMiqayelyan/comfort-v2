"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Box, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";

export function ArViewer({ className }: { className?: string }) {
  const t = useTranslations("ar");
  const [pageUrl, setPageUrl] = useState("");
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setPageUrl(window.location.href);
    if ("xr" in navigator && navigator.xr) {
      navigator.xr
        .isSessionSupported("immersive-ar")
        .then(setXrSupported)
        .catch(() => setXrSupported(false));
    } else {
      setXrSupported(false);
    }
  }, []);

  const handleLaunchAr = useCallback(async () => {
    if (!navigator.xr) return;
    try {
      const supported = await navigator.xr.isSessionSupported("immersive-ar");
      if (!supported) {
        setXrSupported(false);
        return;
      }
      alert("AR session would launch on a compatible device with a 3D model.");
    } catch {
      setXrSupported(false);
    }
  }, []);

  return (
    <section className={cn("container-wide py-10 lg:py-16", className)}>
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <Badge className="mb-4 border-accent/30 bg-accent/10 text-accent">
            <Box className="mr-1.5 size-3.5" aria-hidden />
            WebXR
          </Badge>
          <h1 className="display text-3xl md:text-4xl">{t("title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </header>

        <div className="glass rounded-3xl p-8 shadow-soft md:p-12">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm space-y-6 text-center md:text-left">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-accent/15 text-accent md:mx-0">
                <Smartphone className="size-8" aria-hidden />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                View Comfort profiles at true scale in your room. Launch AR on a
                compatible mobile device or scan the QR code to open this page
                on your phone.
              </p>

              <Button
                type="button"
                variant="accent"
                size="lg"
                onClick={handleLaunchAr}
                disabled={xrSupported === false}
                aria-describedby={
                  xrSupported === false ? "ar-unsupported" : undefined
                }
              >
                {t("launch")}
              </Button>

              {xrSupported === false && (
                <p
                  id="ar-unsupported"
                  className="rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground"
                  role="status"
                >
                  {t("unsupported")}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("qr")}
              </p>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-soft">
                {pageUrl ? (
                  <QRCodeSVG
                    value={pageUrl}
                    size={180}
                    level="M"
                    includeMargin
                    aria-label={t("qr")}
                  />
                ) : (
                  <div
                    className="size-[180px] skeleton rounded-xl"
                    aria-hidden
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

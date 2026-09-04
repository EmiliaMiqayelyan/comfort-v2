"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Download, Leaf, Ruler, Shield, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { Reveal } from "@/components/molecules/reveal";
import { useHeroSettings } from "@/hooks/use-catalog";
import { cn, mediaSrc } from "@/lib/utils";

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=80";

const trustItems = [
  { key: "quality" as const, icon: Award },
  { key: "design" as const, icon: Ruler },
  { key: "durable" as const, icon: Shield },
  { key: "eco" as const, icon: Leaf },
];

function resolveHeroImages(settings: { images?: string[]; image?: string } | null | undefined) {
  const fromArray = (settings?.images ?? [])
    .map((item) => mediaSrc(item, ""))
    .filter(Boolean);
  if (fromArray.length > 0) return fromArray;
  if (settings?.image) {
    const single = mediaSrc(settings.image, "");
    if (single) return [single];
  }
  return [DEFAULT_HERO_IMAGE];
}

export function HeroSection() {
  const t = useTranslations("hero");
  const tTrust = useTranslations("trust");
  const { data: settings } = useHeroSettings();
  const slides = useMemo(() => resolveHeroImages(settings), [settings]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [slides.join("|")]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slideCount = slides.length;
  const current = String(active + 1).padStart(2, "0");
  const total = String(slideCount).padStart(2, "0");

  return (
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {slides.map((slide, i) =>
            i === active ? (
              <motion.div
                key={`${slide}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={slide}
                  alt=""
                  fill
                  priority={i === 0}
                  unoptimized={slide.startsWith("http") || slide.includes("/uploads/")}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{ background: "var(--hero-overlay)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-end pt-24 md:pt-28">
        <div className="container-wide px-4 pb-6 md:px-8 md:pb-10">
          <div className="max-w-3xl">
            <Reveal delay={0.1}>
              <h1 className="display text-balance text-[2.35rem] leading-[1.1] text-white sm:text-4xl md:text-6xl lg:text-7xl">
                {t("title")}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/90 sm:mt-5 md:text-xl">
                {t("subtitle")}
              </p>
            </Reveal>

            <Reveal delay={0.3} className="mt-6 flex flex-col items-start gap-4 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                variant="accent"
                size="lg"
                className="h-12 px-6 text-base md:h-13 md:px-8"
              >
                <Link href="/products">
                  {t("explore")}
                  <ArrowUpRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="glass"
                size="lg"
                className="hidden border-white/25 bg-white/10 text-white hover:bg-white/20 sm:inline-flex"
              >
                <a href="/downloads/catalog.pdf" download>
                  <Download />
                  {t("downloadCatalog")}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="hidden border-white/30 bg-transparent text-white hover:bg-white/10 sm:inline-flex"
              >
                <Link href="/contact">{t("requestSamples")}</Link>
              </Button>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:hidden">
                <a
                  href="/downloads/catalog.pdf"
                  download
                  className="text-base tracking-wide text-white/90 underline-offset-4 hover:text-white hover:underline"
                >
                  {t("downloadCatalog")}
                </a>
                <Link
                  href="/contact"
                  className="text-base tracking-wide text-white/90 underline-offset-4 hover:text-white hover:underline"
                >
                  {t("requestSamples")}
                </Link>
              </div>
            </Reveal>
          </div>

          {slideCount > 1 ? (
            <Reveal delay={0.4} className="mt-8 flex items-center gap-3 md:mt-12 md:gap-4">
              <span className="font-mono text-[11px] tracking-widest text-white md:text-sm">{current}</span>
              <div className="flex h-px max-w-[88px] flex-1 items-center gap-1 md:max-w-[120px]">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${t("slide")} ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-px flex-1 transition-all duration-500",
                      i === active ? "bg-white" : "bg-white/30",
                    )}
                  />
                ))}
              </div>
              <span className="font-mono text-[11px] tracking-widest text-white/50 md:text-sm">{total}</span>
            </Reveal>
          ) : null}
        </div>
      </div>

      <Reveal delay={0.5} className="relative z-10 hidden shrink-0 md:block">
        <div className="border-t border-white/15 bg-black/45 backdrop-blur-md">
          <div className="container-wide grid grid-cols-2 gap-6 px-4 py-6 md:grid-cols-4 md:px-8 md:py-8">
            {trustItems.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-center gap-3 text-white">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10">
                  <Icon className="h-4 w-4 text-white" strokeWidth={1.75} />
                </span>
                <span className="text-xs leading-snug tracking-wide sm:text-sm">
                  {tTrust(key)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

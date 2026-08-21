"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Award, Download, Leaf, Ruler, Shield, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { Reveal } from "@/components/molecules/reveal";
import { heroSlides } from "@/data/catalog";
import { cn } from "@/lib/utils";

const trustItems = [
  { key: "quality" as const, icon: Award },
  { key: "design" as const, icon: Ruler },
  { key: "durable" as const, icon: Shield },
  { key: "eco" as const, icon: Leaf },
];

export function HeroSection() {
  const t = useTranslations("hero");
  const tTrust = useTranslations("trust");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slideCount = heroSlides.length;
  const current = String(active + 1).padStart(2, "0");
  const total = String(slideCount).padStart(2, "0");

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          {heroSlides.map(
            (slide, i) =>
              i === active && (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    priority={i === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{ background: "var(--hero-overlay)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end pb-8 pt-28 md:pb-12">
        <div className="container-wide px-4 md:px-8">
          <div className="max-w-3xl">
            <Reveal delay={0.1}>
              <h1 className="display text-balance text-4xl leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {t("title")}
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg md:text-xl">
                {t("subtitle")}
              </p>
            </Reveal>

            <Reveal delay={0.3} className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg">
                <Link href="/products">
                  {t("explore")}
                  <ArrowUpRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="glass"
                size="lg"
                className="border-white/25 bg-white/10 text-white hover:bg-white/20"
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
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href="/contact">{t("requestSamples")}</Link>
              </Button>
            </Reveal>
          </div>

          {/* Slide indicator */}
          <Reveal delay={0.4} className="mt-12 flex items-center gap-4">
            <span className="font-mono text-sm tracking-widest text-white">
              {current}
            </span>
            <div className="flex h-px flex-1 max-w-[120px] items-center gap-1">
              {heroSlides.map((_, i) => (
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
            <span className="font-mono text-sm tracking-widest text-white/50">
              {total}
            </span>
          </Reveal>
        </div>

        {/* Trust bar */}
        <Reveal delay={0.5} className="mt-10 md:mt-16">
          <div className="border-t border-white/15 bg-black/45 backdrop-blur-md">
            <div className="container-wide grid grid-cols-2 gap-6 px-4 py-6 md:grid-cols-4 md:px-8 md:py-8">
              {trustItems.map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center gap-3 text-white"
                >
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
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { Reveal } from "@/components/molecules/reveal";
import { siteImages } from "@/data/catalog";

export function AboutTeaser() {
  const t = useTranslations("about");

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="mb-4 text-xs font-medium tracking-[0.2em] uppercase text-accent">
              Comfort
            </p>
            <h2 className="display text-balance text-3xl text-foreground md:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("subtitle")}
            </p>
            <Button asChild variant="outline" size="lg" className="mt-8">
              <Link href="/about">
                {t("learnMore")}
                <ArrowUpRight />
              </Link>
            </Button>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft lg:aspect-[5/6]">
              <Image
                src={siteImages.living}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

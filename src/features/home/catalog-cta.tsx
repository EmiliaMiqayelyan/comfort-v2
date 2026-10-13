"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Download, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { Reveal } from "@/components/molecules/reveal";
import { siteImages } from "@/data/catalog";

export function CatalogCta() {
  const hero = useTranslations("hero");
  const downloads = useTranslations("downloads");
  const nav = useTranslations("nav");

  return (
    <section className="bg-secondary/50 py-12 md:py-16">
      <div className="container-comfort px-4 md:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-card shadow-soft">
            <div className="grid lg:grid-cols-[minmax(0,280px)_1fr]">
              <div className="relative hidden min-h-[220px] lg:block">
                <Image
                  src={siteImages.catalog}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="280px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
              </div>

              <div className="flex flex-col justify-center px-6 py-8 md:px-8 md:py-10">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-accent">
                  {downloads("catalogs")}
                </p>
                <h2 className="display mt-2 text-balance text-2xl text-foreground md:text-3xl">
                  {downloads("title")}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {downloads("subtitle")}
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button asChild variant="accent">
                    <a href="/downloads/catalog.pdf" download>
                      <Download />
                      {hero("downloadCatalog")}
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact">
                      {hero("requestSamples")}
                      <ArrowUpRight />
                    </Link>
                  </Button>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  {nav("requestCatalog")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

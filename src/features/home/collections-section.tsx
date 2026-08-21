"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { getLocalized } from "@/data/catalog";
import { useCollections } from "@/hooks/use-catalog";
import { mediaSrc } from "@/lib/utils";

export function CollectionsSection() {
  const t = useTranslations("collections");
  const locale = useLocale();
  const { data: collections = [] } = useCollections();

  return (
    <section className="bg-secondary/50 py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 text-sm tracking-wide text-muted-foreground transition hover:text-accent"
          >
            {t("viewAll")}
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3 xl:grid-cols-6 md:pb-0">
          {collections.map((collection, i) => (
            <Reveal
              key={collection.id}
              delay={i * 0.06}
              className="w-[260px] min-w-0 shrink-0 md:w-full"
            >
              <Link
                href={`/collections/${collection.slug}`}
                className="group block h-full overflow-hidden rounded-3xl bg-card shadow-soft transition hover:shadow-[0_24px_64px_rgba(17,24,39,0.12)]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#ecece8]">
                  <Image
                    src={mediaSrc(collection.image)}
                    alt={getLocalized(collection.name, locale)}
                    fill
                    quality={95}
                    className="catalog-cover"
                    sizes="(max-width: 768px) 260px, (max-width: 1280px) 30vw, 220px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="display text-lg leading-tight">
                      {getLocalized(collection.name, locale)}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-white/70">
                      {getLocalized(collection.description, locale)}
                    </p>
                    <p className="mt-3 text-xs tracking-wide text-white/85">
                      {t("products", { count: collection.productCount })}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

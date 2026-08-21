"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import { useCollections } from "@/hooks/use-catalog";
import { mediaSrc } from "@/lib/utils";

const STYLES = ["all", "minimal", "natural", "modern", "classic"] as const;

export function CollectionsGrid() {
  const t = useTranslations("collections");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [activeStyle, setActiveStyle] = useState<string>("all");
  const [query, setQuery] = useState("");
  const { data: collections = [] } = useCollections();

  const filtered = useMemo(() => {
    return collections.filter((col) => {
      const matchesStyle =
        activeStyle === "all" || col.style === activeStyle;
      const name = getLocalized(col.name, locale).toLowerCase();
      const desc = getLocalized(col.description, locale).toLowerCase();
      const q = query.toLowerCase();
      const matchesQuery = !q || name.includes(q) || desc.includes(q);
      return matchesStyle && matchesQuery;
    });
  }, [activeStyle, query, locale, collections]);

  return (
    <>
      <Reveal className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="h-12 w-full max-w-md rounded-full border border-border bg-card px-5 text-sm outline-none transition focus:border-foreground/30 md:w-auto"
        />
        <div className="flex flex-wrap gap-2">
          {STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setActiveStyle(style)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs uppercase tracking-wider transition",
                activeStyle === style
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground/30",
              )}
            >
              {style === "all" ? tc("all") : style}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal className="mb-8">
        <p className="text-sm text-muted-foreground">
          {t("results", { count: filtered.length })}
        </p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 0.06}>
            <Link
              href={`/collections/${collection.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition hover:shadow-[0_24px_64px_rgba(17,24,39,0.12)]"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ecece8]">
                <Image
                  src={mediaSrc(collection.image)}
                  alt={getLocalized(collection.name, locale)}
                  fill
                  quality={95}
                  className="catalog-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <Badge className="absolute left-4 top-4 border-white/20 bg-background/80 capitalize backdrop-blur">
                  {collection.style}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6 md:p-8">
                <h3 className="display text-xl text-foreground md:text-2xl">
                  {getLocalized(collection.name, locale)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {getLocalized(collection.description, locale)}
                </p>
                <p className="mt-auto pt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  {t("products", { count: collection.productCount })}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}

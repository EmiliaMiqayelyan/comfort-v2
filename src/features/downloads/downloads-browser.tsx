"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Download, FileText } from "lucide-react";
import { Reveal } from "@/components/molecules/reveal";
import { Badge } from "@/components/atoms/badge";
import { getLocalized } from "@/data/catalog";
import { catalogApi } from "@/lib/api";
import { useEffect } from "react";
import type { DownloadCategory, DownloadFile } from "@/types";
import { cn } from "@/lib/utils";

const FILTERS: Array<"all" | DownloadCategory> = [
  "all",
  "catalogs",
  "templates",
  "collections",
  "pdf",
  "cad",
  "bim",
  "guides",
  "other",
];

export function DownloadsBrowser() {
  const t = useTranslations("downloads");
  const locale = useLocale();
  const [items, setItems] = useState<DownloadFile[]>([]);
  const [active, setActive] = useState<(typeof FILTERS)[number]>("all");

  useEffect(() => {
    catalogApi.downloads(true).then((files) => setItems(files ?? []));
  }, []);

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((item) => item.category === active)),
    [active, items],
  );

  return (
    <>
      <Reveal className="mb-12">
        <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
          {t("categories")}
        </h2>
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition",
                active === id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30",
              )}
            >
              {id === "all" ? t("all") : t(id)}
            </button>
          ))}
        </div>
      </Reveal>

      {filtered.length > 0 ? (
        <ul className="space-y-4">
          {filtered.map((file, i) => (
            <Reveal key={file.id} delay={i * 0.04}>
              <li>
                <a
                  href={file.url}
                  download={file.filename}
                  className="catalog-panel catalog-shadow group flex items-center gap-5 rounded-3xl border px-6 py-5 transition hover:border-foreground/30"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    {file.category === "pdf" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {getLocalized(file.title, locale)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {file.filename}
                      {file.size ? ` · ${file.size}` : ""}
                    </span>
                  </span>
                  <Badge>{file.category.toUpperCase()}</Badge>
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      ) : (
        <Reveal>
          <p className="text-muted-foreground">{t("empty")}</p>
        </Reveal>
      )}
    </>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { Badge } from "@/components/atoms/badge";
import { getLocalized } from "@/data/catalog";
import { loadProducts } from "@/lib/catalog-source";
import { catalogApi } from "@/lib/api";
import { jsonArray } from "@/lib/utils";
import type { ProductDownload } from "@/types";
import { Download, FileText } from "lucide-react";

const DOWNLOAD_CATEGORIES = [
  { id: "pdf", labelKey: "pdf" as const },
  { id: "cad", labelKey: "cad" as const },
  { id: "bim", labelKey: "bim" as const },
  { id: "max", labelKey: "max" as const },
  { id: "textures", labelKey: "textures" as const },
  { id: "catalogs", labelKey: "catalogs" as const },
  { id: "guides", labelKey: "guides" as const },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("downloadsTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: `https://comfort.am/${locale}/downloads`,
      languages: {
        am: "https://comfort.am/am/downloads",
        ru: "https://comfort.am/ru/downloads",
        en: "https://comfort.am/en/downloads",
      },
    },
    openGraph: {
      title: t("downloadsTitle"),
      url: `https://comfort.am/${locale}/downloads`,
      locale,
    },
  };
}

export default async function DownloadsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "downloads" });

  const products = await loadProducts();
  const files = (await catalogApi.downloads(true)) ?? [];

  const allDownloads = [
    ...files.map((file) => ({
      id: file.id,
      type: file.category === "pdf" || file.category === "catalogs" ? "pdf" : "other",
      label: file.title,
      url: file.url,
      size: file.size,
      productName: file.title,
    })),
    ...products.flatMap((product) =>
      jsonArray<ProductDownload>(product.downloads).map((file) => ({
        ...file,
        productName: product.name,
      })),
    ),
  ];

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-16 max-w-3xl">
          <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </Reveal>

        <Reveal className="mb-12">
          <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
            {t("categories")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {DOWNLOAD_CATEGORIES.map((cat) => (
              <Badge
                key={cat.id}
                className="cursor-default px-4 py-2 text-sm"
              >
                {t(cat.labelKey)}
              </Badge>
            ))}
          </div>
        </Reveal>

        {allDownloads.length > 0 ? (
          <ul className="space-y-4">
            {allDownloads.map((file, i) => (
              <Reveal key={file.id} delay={i * 0.04}>
                <li>
                  <a
                    href={file.url}
                    download
                    className="group flex items-center gap-5 rounded-3xl border border-border bg-card px-6 py-5 transition hover:border-foreground/20 hover:shadow-soft"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      {file.type === "pdf" ? (
                        <FileText className="h-5 w-5" />
                      ) : (
                        <Download className="h-5 w-5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {getLocalized(file.label, locale)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getLocalized(file.productName, locale)}
                        {file.size ? ` · ${file.size}` : ""}
                      </span>
                    </span>
                    <Badge>{file.type.toUpperCase()}</Badge>
                  </a>
                </li>
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal>
            <p className="text-muted-foreground">{t("search")}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

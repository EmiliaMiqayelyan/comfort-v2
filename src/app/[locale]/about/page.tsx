import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { Badge } from "@/components/atoms/badge";
import { catalogApi } from "@/lib/api";
import { getLocalized, siteImages } from "@/data/catalog";
import { FileText } from "lucide-react";

const TIMELINE = [
  { year: "2010", key: "founded" },
  { year: "2015", key: "factory" },
  { year: "2020", key: "export" },
  { year: "2026", key: "digital" },
] as const;

const VALUES = ["production", "materials", "technology", "design"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("aboutTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: `https://comfort.am/${locale}/about`,
      languages: {
        am: "https://comfort.am/am/about",
        ru: "https://comfort.am/ru/about",
        en: "https://comfort.am/en/about",
      },
    },
    openGraph: {
      title: t("aboutTitle"),
      url: `https://comfort.am/${locale}/about`,
      locale,
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const ta = await getTranslations({ locale, namespace: "advantages" });
  const certificates = await catalogApi.certificates();

  return (
    <>
      <section className="bg-background pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="container-wide px-4 md:px-8">
          <Reveal className="max-w-4xl">
            <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container-wide px-4 md:px-8">
          <Reveal>
            <h2 className="display mb-12 text-3xl text-foreground md:text-4xl">
              {t("mission")}
            </h2>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {t("missionText")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-wide px-4 md:px-8">
          <Reveal className="mb-16">
            <h2 className="display text-3xl text-foreground md:text-4xl">
              {t("values")}
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, i) => (
              <Reveal key={value} delay={i * 0.08}>
                <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
                  <h3 className="display text-lg text-foreground">
                    {ta(value)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {ta(`${value}Desc`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container-wide px-4 md:px-8">
          <Reveal className="mb-16">
            <h2 className="display text-3xl text-foreground md:text-4xl">
              {t("timeline")}
            </h2>
          </Reveal>
          <div className="relative space-y-12 border-l border-border pl-8 md:pl-12">
            {TIMELINE.map((item, i) => (
              <Reveal key={item.year} delay={i * 0.1}>
                <div className="relative">
                  <span className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-foreground md:-left-[calc(3rem+5px)]" />
                  <p className="display text-2xl text-accent">{item.year}</p>
                  <p className="mt-2 max-w-xl text-muted-foreground">
                    {t("missionText")}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-wide px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
                <Image
                  src={siteImages.factory}
                  alt={t("factory")}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex flex-col justify-center">
              <h2 className="display text-3xl text-foreground md:text-4xl">
                {t("factory")}
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                {t("factoryText")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Badge>{t("technology")}</Badge>
                <Badge>{t("quality")}</Badge>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container-wide px-4 md:px-8">
          <Reveal className="mb-12">
            <h2 className="display text-3xl text-foreground md:text-4xl">
              {t("certificates")}
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(certificates ?? []).length === 0 ? (
              <p className="text-muted-foreground">{t("certificatesEmpty")}</p>
            ) : (
              (certificates ?? []).map((cert, i) => (
              <Reveal key={cert.id} delay={i * 0.06}>
                <a
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-3xl border border-border bg-card px-6 py-8 text-center shadow-soft transition hover:border-accent/40"
                >
                  {cert.image ? (
                    <span className="relative mx-auto mb-4 block h-20 w-20 overflow-hidden rounded-xl bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cert.image} alt="" className="h-full w-full object-cover" />
                    </span>
                  ) : (
                    <FileText className="mx-auto mb-4 h-6 w-6 text-accent" />
                  )}
                  <p className="display text-sm text-foreground md:text-base">
                    {getLocalized(cert.title, locale)}
                  </p>
                  {cert.issuer && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {cert.issuer}
                      {cert.year ? ` · ${cert.year}` : ""}
                    </p>
                  )}
                </a>
              </Reveal>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

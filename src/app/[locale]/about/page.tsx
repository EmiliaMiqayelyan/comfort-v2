import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import { FileText } from "lucide-react";

const ABOUT_IMAGE = "/images/about/about_comf.jpg";

const PARTNER_LOGOS = [
  { src: "/images/partners/domus-1.svg", alt: "Domus" },
  { src: "/images/partners/domus-2.svg", alt: "Partner" },
  { src: "/images/partners/domus-3.svg", alt: "Partner" },
  { src: "/images/partners/domus-4.svg", alt: "Partner" },
  { src: "/images/partners/rbandb.svg", alt: "RB & B" },
  { src: "/images/partners/visionarch.jpg", alt: "Vision Arch" },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const about = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("aboutTitle"),
    description: about("subtitle"),
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
  const certificates = await catalogApi.certificates();

  return (
    <>
      <section className="bg-background pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container-wide px-4 md:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="relative aspect-[620/348] overflow-hidden rounded-[20px] shadow-soft">
                <Image
                  src={ABOUT_IMAGE}
                  alt={t("factoryImageAlt")}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="display text-4xl text-foreground md:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("body")}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16 md:py-20">
        <div className="container-wide px-4 md:px-8">
          <Reveal className="mb-12 text-center">
            <h2 className="display text-3xl text-foreground md:text-4xl">
              {t("ourPartners")}
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-between">
            {PARTNER_LOGOS.map((logo, i) => (
              <Reveal key={logo.src} delay={i * 0.05}>
                <div className="relative flex h-16 w-28 items-center justify-center sm:h-20 sm:w-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-h-16 w-auto max-w-full object-contain sm:max-h-20"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
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
                        <img
                          src={cert.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
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

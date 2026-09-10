import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { PartnersMarquee } from "@/features/about/partners-marquee";
import { catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { FileText } from "lucide-react";

const ABOUT_IMAGE = "/images/about/about_comf.jpg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const tAbout = await getTranslations({ locale, namespace: "about" });
  return buildPageMetadata({
    locale,
    path: "/about",
    title: t("aboutTitle"),
    description: t.has("aboutDescription")
      ? t("aboutDescription")
      : tAbout("subtitle"),
    images: ABOUT_IMAGE,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const [certificates, partners] = await Promise.all([
    catalogApi.certificates(),
    catalogApi.partners(),
  ]);
  const partnerList = partners ?? [];
  const certificateList = certificates ?? [];

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

      {partnerList.length > 0 ? (
        <section className="border-t border-border bg-muted/30 py-16 md:py-20">
          <div className="container-wide px-4 md:px-8">
            <Reveal className="mb-12 text-center">
              <h2 className="display text-3xl text-foreground md:text-4xl">
                {t("ourPartners")}
              </h2>
            </Reveal>
            <PartnersMarquee partners={partnerList} />
          </div>
        </section>
      ) : null}

      {certificateList.length > 0 ? (
        <section className="py-20 md:py-28">
          <div className="container-wide px-4 md:px-8">
            <Reveal className="mb-12">
              <h2 className="display text-3xl text-foreground md:text-4xl">
                {t("certificates")}
              </h2>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {certificateList.map((cert, i) => (
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
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

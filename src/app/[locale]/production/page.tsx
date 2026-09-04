import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { siteImages } from "@/data/catalog";
import { ArrowUpRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: `${t("factory")} — Comfort`,
    description: t("factoryText"),
  };
}

export default async function ProductionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <section className="bg-background pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-12 max-w-3xl">
          <Badge className="mb-4">{nav("production")}</Badge>
          <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
            {t("factory")}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {t("factoryText")}
          </p>
        </Reveal>

        <Reveal>
          <div className="relative mb-16 aspect-[21/9] overflow-hidden rounded-3xl shadow-soft">
            <Image
              src={siteImages.factory}
              alt={t("factory")}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {(["technology", "quality", "certificates"] as const).map((key, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
                <h2 className="display text-xl text-foreground">{t(key)}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("factoryText")}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <Button asChild variant="accent" size="lg">
            <Link href="/about">
              {t("learnMore")}
              <ArrowUpRight />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

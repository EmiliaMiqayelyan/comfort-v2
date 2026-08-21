import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { Button } from "@/components/atoms/button";
import { ArrowUpRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "partners" });
  return {
    title: `${t("title")} — Comfort`,
    description: t("subtitle"),
    alternates: {
      canonical: `https://comfort.am/${locale}/partners`,
    },
    openGraph: {
      title: t("title"),
      url: `https://comfort.am/${locale}/partners`,
      locale,
    },
  };
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partners" });
  const ta = await getTranslations({ locale, namespace: "advantages" });

  const benefits = [
    "production",
    "materials",
    "technology",
    "design",
    "warranty",
  ] as const;

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
          <Button asChild size="xl" className="mt-10">
            <Link href="/contact">
              {t("cta")}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </Reveal>

        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((key, i) => (
            <Reveal key={key} delay={i * 0.08}>
              <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
                <h2 className="display text-lg text-foreground">{ta(key)}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {ta(`${key}Desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

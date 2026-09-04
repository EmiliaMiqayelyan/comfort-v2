import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { CollectionsGrid } from "@/features/collections/collections-grid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("collectionsTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: `https://comfort.am/${locale}/collections`,
      languages: {
        am: "https://comfort.am/am/collections",
        ru: "https://comfort.am/ru/collections",
        en: "https://comfort.am/en/collections",
      },
    },
    openGraph: {
      title: t("collectionsTitle"),
      url: `https://comfort.am/${locale}/collections`,
      locale,
    },
  };
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "collections" });

  return (
    <section className="catalog-surface min-h-screen py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-16 max-w-3xl">
          <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
        </Reveal>
        <CollectionsGrid />
      </div>
    </section>
  );
}

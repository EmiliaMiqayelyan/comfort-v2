import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { ArViewer } from "@/features/ar/ar-viewer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tAr = await getTranslations({ locale, namespace: "ar" });
  return {
    title: `${tAr("title")} — Comfort`,
    description: tAr("subtitle"),
    alternates: {
      canonical: `https://comfort.am/${locale}/ar`,
    },
    openGraph: {
      title: tAr("title"),
      url: `https://comfort.am/${locale}/ar`,
      locale,
    },
  };
}

export default async function ArPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ar" });

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
        <ArViewer />
      </div>
    </section>
  );
}

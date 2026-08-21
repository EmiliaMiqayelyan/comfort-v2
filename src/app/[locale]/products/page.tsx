import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { ProductsCatalog } from "@/features/products/products-catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("productsTitle"),
    description: t("homeDescription"),
    alternates: {
      canonical: `https://comfort.am/${locale}/products`,
      languages: {
        am: "https://comfort.am/am/products",
        ru: "https://comfort.am/ru/products",
        en: "https://comfort.am/en/products",
      },
    },
    openGraph: {
      title: t("productsTitle"),
      url: `https://comfort.am/${locale}/products`,
      locale,
    },
  };
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "categories" });

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-16 max-w-3xl">
          <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("viewAll")}
          </p>
        </Reveal>
        <ProductsCatalog />
      </div>
    </section>
  );
}

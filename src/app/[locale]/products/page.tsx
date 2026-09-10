import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductsCatalog } from "@/features/products/products-catalog";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildPageMetadata({
    locale,
    path: "/products",
    title: t("productsTitle"),
    description: t("productsDescription"),
  });
}

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="catalog-surface min-h-screen py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <ProductsCatalog />
      </div>
    </section>
  );
}

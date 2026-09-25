import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { CollectionsGrid } from "@/features/collections/collections-grid";
import { loadCategories, loadCollections, loadProducts } from "@/lib/catalog-source";
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
    path: "/collections",
    title: t("collectionsTitle"),
    description: t("collectionsDescription"),
  });
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "collections" });
  const [collections, categories, products] = await Promise.all([
    loadCollections(),
    loadCategories(),
    loadProducts(),
  ]);

  return (
    <section className="catalog-surface min-h-screen py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-16 max-w-3xl">
          <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
        </Reveal>
        <CollectionsGrid
          initialCollections={collections}
          initialCategories={categories}
          initialProducts={products}
        />
      </div>
    </section>
  );
}

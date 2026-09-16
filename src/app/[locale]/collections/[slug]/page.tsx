import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CollectionDetailContent } from "@/features/collections/collection-detail-content";
import { getLocalized } from "@/data/catalog";
import { loadCollection, loadCollections } from "@/lib/catalog-source";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, siteUrl } from "@/lib/seo";
import { BreadcrumbJsonLd, CollectionPageJsonLd } from "@/components/seo/json-ld";
import { firstMedia } from "@/lib/utils";

export async function generateStaticParams() {
  const collections = await loadCollections();
  return routing.locales.flatMap((locale) =>
    collections.map((collection) => ({ locale, slug: collection.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = await loadCollection(slug);
  if (!collection) {
    return { title: "Accessory", robots: { index: false, follow: false } };
  }

  const name = getLocalized(collection.name, locale);
  const description = getLocalized(collection.description, locale);
  const image = firstMedia(collection.images) || collection.image;

  return buildPageMetadata({
    locale,
    path: `/collections/${slug}`,
    title: name,
    description,
    images: image || undefined,
  });
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const collection = await loadCollection(slug);
  if (!collection) notFound();

  const t = await getTranslations({ locale, namespace: "collections" });
  const name = getLocalized(collection.name, locale);
  const description = getLocalized(collection.description, locale);
  const image = firstMedia(collection.images) || collection.image;
  const url = siteUrl(locale, `/collections/${slug}`);

  return (
    <section className="catalog-surface min-h-screen pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container-wide px-4 md:px-8">
        <CollectionPageJsonLd
          name={name}
          description={description}
          url={url}
          image={image || undefined}
        />
        <BreadcrumbJsonLd
          items={[
            { name: "Comfort", url: siteUrl(locale) },
            { name: t("title"), url: siteUrl(locale, "/collections") },
            { name, url },
          ]}
        />
        <CollectionDetailContent collection={collection} />
      </div>
    </section>
  );
}

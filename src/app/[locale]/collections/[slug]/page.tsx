import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { CollectionDetailContent } from "@/features/collections/collection-detail-content";
import { getLocalized } from "@/data/catalog";
import { loadCollection, loadCollections } from "@/lib/catalog-source";
import { routing } from "@/i18n/routing";
import { firstMedia } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

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
  if (!collection) return { title: "Collection — Comfort" };

  const name = getLocalized(collection.name, locale);
  const description = getLocalized(collection.description, locale);
  const image = firstMedia(collection.images) || collection.image;

  return {
    title: `${name} — Comfort`,
    description,
    alternates: {
      canonical: `https://comfort.am/${locale}/collections/${slug}`,
    },
    openGraph: {
      title: name,
      description,
      images: image ? [{ url: image }] : undefined,
      locale,
    },
  };
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

  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <section className="catalog-surface min-h-screen pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="container-wide px-4 md:px-8">
        <Link
          href="/collections"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {tc("back")}
        </Link>

        <CollectionDetailContent collection={collection} />
      </div>
    </section>
  );
}

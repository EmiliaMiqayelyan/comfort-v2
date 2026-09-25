import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CollectionDetailContent } from "@/features/collections/collection-detail-content";
import { getLocalized } from "@/data/catalog";
import {
  CATALOG_PAGE_SIZE,
  loadCollection,
  loadCollections,
  loadProductsPage,
} from "@/lib/catalog-source";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, siteUrl } from "@/lib/seo";
import {
  BreadcrumbJsonLd,
  CollectionPageJsonLd,
  ItemListJsonLd,
} from "@/components/seo/json-ld";
import { firstMedia } from "@/lib/utils";

function parsePage(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export async function generateStaticParams() {
  const collections = await loadCollections();
  return routing.locales.flatMap((locale) =>
    collections.map((collection) => ({ locale, slug: collection.slug })),
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const collection = await loadCollection(slug);
  if (!collection) {
    return { title: "Accessory", robots: { index: false, follow: false } };
  }

  const name = getLocalized(collection.name, locale);
  const description = getLocalized(collection.description, locale);
  const image = firstMedia(collection.images) || collection.image;
  const path = `/collections/${slug}`;
  const metadata = buildPageMetadata({
    locale,
    path,
    title: page > 1 ? `${name} — ${page}` : name,
    description,
    images: image || undefined,
  });
  const base = siteUrl(locale, path);
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: page > 1 ? `${base}?page=${page}` : base,
    },
  };
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  setRequestLocale(locale);

  const collection = await loadCollection(slug);
  if (!collection) notFound();

  const initialProducts = await loadProductsPage({
    collection: collection.slug,
    page,
    limit: CATALOG_PAGE_SIZE,
  });

  const t = await getTranslations({ locale, namespace: "collections" });
  const name = getLocalized(collection.name, locale);
  const description = getLocalized(collection.description, locale);
  const image = firstMedia(collection.images) || collection.image;
  const url = siteUrl(locale, `/collections/${slug}`);
  const productsUrl = siteUrl(locale, "/products");

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
        {initialProducts.items.length > 0 ? (
          <ItemListJsonLd
            name={name}
            url={page > 1 ? `${url}?page=${page}` : url}
            items={initialProducts.items.map((item) => ({
              name: getLocalized(item.name, locale),
              url: `${productsUrl}/${item.slug}`,
              image: firstMedia(item.images) || undefined,
            }))}
          />
        ) : null}
        <CollectionDetailContent
          collection={collection}
          initialProducts={initialProducts}
        />
      </div>
    </section>
  );
}

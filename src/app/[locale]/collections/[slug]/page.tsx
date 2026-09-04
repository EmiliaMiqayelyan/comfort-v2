import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { Badge } from "@/components/atoms/badge";
import { getLocalized } from "@/data/catalog";
import { loadCollection, loadCollections, loadProducts } from "@/lib/catalog-source";
import { routing } from "@/i18n/routing";
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

  return {
    title: `${name} — Comfort`,
    description,
    alternates: {
      canonical: `https://comfort.am/${locale}/collections/${slug}`,
    },
    openGraph: {
      title: name,
      description,
      images: [{ url: collection.image }],
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

  const allProducts = await loadProducts();
  const collectionProducts = allProducts.filter(
    (p) => p.collectionId === collection.id,
  );
  const t = await getTranslations({ locale, namespace: "collections" });
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

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-soft">
              <Image
                src={collection.image}
                alt={getLocalized(collection.name, locale)}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col justify-center">
            <Badge className="mb-4 w-fit capitalize">{collection.style}</Badge>
            <h1 className="display text-4xl text-foreground md:text-5xl">
              {getLocalized(collection.name, locale)}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {getLocalized(collection.description, locale)}
            </p>
            <p className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
              {t("products", { count: collection.productCount })}
            </p>
          </Reveal>
        </div>

        {collectionProducts.length > 0 && (
          <div className="mt-24 border-t border-border pt-24">
            <Reveal>
              <h2 className="display mb-12 text-2xl text-foreground md:text-3xl">
                {t("title")}
              </h2>
            </Reveal>
            <ProductCardGrid products={collectionProducts} />
          </div>
        )}
      </div>
    </section>
  );
}

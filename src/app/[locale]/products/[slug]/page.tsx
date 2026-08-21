import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProductDetailContent } from "@/features/products/product-detail-content";
import { CategoryDetailContent } from "@/features/products/category-detail-content";
import { getLocalized } from "@/data/catalog";
import { loadProduct, loadCategory, loadProducts, loadCategories } from "@/lib/catalog-source";
import { routing } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";

export async function generateStaticParams() {
  const [products, categories] = await Promise.all([loadProducts(), loadCategories()]);
  const slugs = [
    ...products.map((product) => product.slug),
    ...categories.map((category) => category.slug),
  ];
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({
      locale,
      slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await loadProduct(slug);
  const category = await loadCategory(slug);

  if (product) {
    const name = getLocalized(product.name, locale);
    const description = getLocalized(product.description, locale);
    return {
      title: `${name} — Comfort`,
      description,
      alternates: {
        canonical: `https://comfort.am/${locale}/products/${slug}`,
        languages: {
          am: `https://comfort.am/am/products/${slug}`,
          ru: `https://comfort.am/ru/products/${slug}`,
          en: `https://comfort.am/en/products/${slug}`,
        },
      },
      openGraph: {
        title: name,
        description,
        url: `https://comfort.am/${locale}/products/${slug}`,
        images: product.images[0] ? [{ url: product.images[0] }] : undefined,
        locale,
      },
    };
  }

  if (category) {
    const name = getLocalized(category.name, locale);
    const description = getLocalized(category.description, locale);
    return {
      title: `${name} — Comfort`,
      description,
      alternates: {
        canonical: `https://comfort.am/${locale}/products/${slug}`,
        languages: {
          am: `https://comfort.am/am/products/${slug}`,
          ru: `https://comfort.am/ru/products/${slug}`,
          en: `https://comfort.am/en/products/${slug}`,
        },
      },
      openGraph: {
        title: name,
        description,
        url: `https://comfort.am/${locale}/products/${slug}`,
        images: [{ url: category.image }],
        locale,
      },
    };
  }

  return { title: "Not found — Comfort" };
}

export default async function ProductOrCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await loadProduct(slug);
  const category = await loadCategory(slug);

  if (!product && !category) notFound();

  const tc = await getTranslations({ locale, namespace: "common" });

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-wide px-4 md:px-8">
        <Link
          href="/products"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {tc("back")}
        </Link>

        {product ? (
          <>
            <ProductJsonLd
              name={getLocalized(product.name, locale)}
              description={getLocalized(product.description, locale)}
              sku={product.sku}
              image={product.images[0]}
              price={product.price}
            />
            <BreadcrumbJsonLd
              items={[
                { name: "Comfort", url: `https://comfort.am/${locale}` },
                { name: "Products", url: `https://comfort.am/${locale}/products` },
                {
                  name: getLocalized(product.name, locale),
                  url: `https://comfort.am/${locale}/products/${product.slug}`,
                },
              ]}
            />
            <ProductDetailContent product={product} />
          </>
        ) : category ? (
          <>
            <BreadcrumbJsonLd
              items={[
                { name: "Comfort", url: `https://comfort.am/${locale}` },
                { name: "Products", url: `https://comfort.am/${locale}/products` },
                {
                  name: getLocalized(category.name, locale),
                  url: `https://comfort.am/${locale}/products/${category.slug}`,
                },
              ]}
            />
            <CategoryDetailContent category={category} />
          </>
        ) : null}
      </div>
    </section>
  );
}

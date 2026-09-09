import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductDetailContent } from "@/features/products/product-detail-content";
import { CategoryDetailContent } from "@/features/products/category-detail-content";
import { getLocalized } from "@/data/catalog";
import { loadProduct, loadCategory, loadProducts, loadCategories } from "@/lib/catalog-source";
import { categoryBreadcrumbChain } from "@/lib/category-tree";
import { routing } from "@/i18n/routing";
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

  const [product, category, categories] = await Promise.all([
    loadProduct(slug),
    loadCategory(slug),
    loadCategories(),
  ]);

  if (!product && !category) notFound();

  const homeUrl = `https://comfort.am/${locale}`;
  const productsUrl = `${homeUrl}/products`;

  if (product) {
    const productCategory = categories.find((item) => item.id === product.categoryId);
    const categoryChain = productCategory
      ? categoryBreadcrumbChain(productCategory.id, categories)
      : [];

    return (
      <section className="catalog-surface min-h-screen pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container-wide px-4 md:px-8">
          <ProductJsonLd
            name={getLocalized(product.name, locale)}
            description={getLocalized(product.description, locale)}
            sku={product.sku}
            image={product.images[0]}
            price={product.price}
          />
          <BreadcrumbJsonLd
            items={[
              { name: "Comfort", url: homeUrl },
              { name: "Products", url: productsUrl },
              ...categoryChain.map((item) => ({
                name: getLocalized(item.name, locale),
                url: `${productsUrl}/${item.slug}`,
              })),
              {
                name: getLocalized(product.name, locale),
                url: `${productsUrl}/${product.slug}`,
              },
            ]}
          />
          <ProductDetailContent product={product} />
        </div>
      </section>
    );
  }

  if (category) {
    const categoryChain = categoryBreadcrumbChain(category.id, categories);

    return (
      <section className="catalog-surface min-h-screen pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container-wide px-4 md:px-8">
          <BreadcrumbJsonLd
            items={[
              { name: "Comfort", url: homeUrl },
              { name: "Products", url: productsUrl },
              ...categoryChain.map((item) => ({
                name: getLocalized(item.name, locale),
                url: `${productsUrl}/${item.slug}`,
              })),
            ]}
          />
          <CategoryDetailContent category={category} />
        </div>
      </section>
    );
  }

  return null;
}

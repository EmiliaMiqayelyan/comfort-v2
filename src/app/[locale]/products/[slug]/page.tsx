import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductDetailContent } from "@/features/products/product-detail-content";
import { CategoryDetailContent } from "@/features/products/category-detail-content";
import { getLocalized } from "@/data/catalog";
import {
  CATALOG_PAGE_SIZE,
  loadProduct,
  loadCategory,
  loadProducts,
  loadCategories,
  loadProductsPage,
} from "@/lib/catalog-source";
import { categoryBreadcrumbChain, childCategories } from "@/lib/category-tree";
import { routing } from "@/i18n/routing";
import { buildPageMetadata, siteUrl } from "@/lib/seo";
import {
  ProductJsonLd,
  BreadcrumbJsonLd,
  ItemListJsonLd,
} from "@/components/seo/json-ld";
import { firstMedia } from "@/lib/utils";

function parsePage(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

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
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const product = await loadProduct(slug);
  const category = await loadCategory(slug);
  const path = `/products/${slug}`;

  if (product) {
    const name = getLocalized(product.name, locale);
    const description = getLocalized(product.description, locale);
    return buildPageMetadata({
      locale,
      path,
      title: name,
      description,
      images: product.images[0],
    });
  }

  if (category) {
    const name = getLocalized(category.name, locale);
    const description = getLocalized(category.description, locale);
    const metadata = buildPageMetadata({
      locale,
      path,
      title: page > 1 ? `${name} — ${page}` : name,
      description,
      images: category.image,
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

  return { title: "Not found", robots: { index: false, follow: false } };
}

export default async function ProductOrCategoryPage({
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

  const [product, category, categories] = await Promise.all([
    loadProduct(slug),
    loadCategory(slug),
    loadCategories(),
  ]);

  if (!product && !category) notFound();

  const homeUrl = siteUrl(locale);
  const productsUrl = siteUrl(locale, "/products");

  if (product) {
    const productCategory = categories.find((item) => item.id === product.categoryId);
    const categoryChain = productCategory
      ? categoryBreadcrumbChain(productCategory.id, categories)
      : [];
    const productUrl = `${productsUrl}/${product.slug}`;

    return (
      <section className="catalog-surface min-h-screen pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container-wide px-4 md:px-8">
          <ProductJsonLd
            name={getLocalized(product.name, locale)}
            description={getLocalized(product.description, locale)}
            sku={product.sku}
            image={product.images[0]}
            price={product.price}
            url={productUrl}
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
                url: productUrl,
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
    const isLeaf = childCategories(categories, category.id).length === 0;
    const initialProducts = isLeaf
      ? await loadProductsPage({
          category: category.slug,
          page,
          limit: CATALOG_PAGE_SIZE,
        })
      : {
          items: [],
          total: 0,
          page: 1,
          pageSize: CATALOG_PAGE_SIZE,
          hasMore: false,
        };

    const listUrl = siteUrl(locale, `/products/${category.slug}`);

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
          {isLeaf && initialProducts.items.length > 0 ? (
            <ItemListJsonLd
              name={getLocalized(category.name, locale)}
              url={page > 1 ? `${listUrl}?page=${page}` : listUrl}
              items={initialProducts.items.map((item) => ({
                name: getLocalized(item.name, locale),
                url: `${productsUrl}/${item.slug}`,
                image: firstMedia(item.images) || undefined,
              }))}
            />
          ) : null}
          <CategoryDetailContent
            category={category}
            initialCategories={categories}
            initialProducts={initialProducts}
          />
        </div>
      </section>
    );
  }

  return null;
}

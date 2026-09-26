"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getLocalized } from "@/data/catalog";
import { cn, FALLBACK_MEDIA, firstMedia, mediaSrc } from "@/lib/utils";
import type { Collection, Product, ProductCategory } from "@/types";

type CatalogCardProps = {
  href: string;
  image?: string | null;
  title: string;
  description?: string;
  className?: string;
};

function resolveCatalogImage(image?: string | null) {
  return mediaSrc(image, FALLBACK_MEDIA);
}

/** Shared card UI for products, collections, and categories. */
export function CatalogCard({
  href,
  image,
  title,
  description,
  className,
}: CatalogCardProps) {
  const resolved = resolveCatalogImage(image);
  const [src, setSrc] = useState(resolved);

  useEffect(() => {
    setSrc(resolveCatalogImage(image));
  }, [image]);

  const isUpload = src.includes("/uploads/");
  const isRemote = /^https?:\/\//i.test(src);
  const isBrandFallback = src === FALLBACK_MEDIA;

  return (
    <Link
      href={href}
      className={cn(
        "catalog-card-item catalog-panel catalog-shadow group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[5px] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#ecece8]">
        <Image
          src={src}
          alt={title}
          fill
          quality={75}
          loading="lazy"
          decoding="async"
          unoptimized={isRemote || isUpload || isBrandFallback}
          className={cn(
            "relative z-[1] object-contain object-center",
            isBrandFallback && "p-[22%]",
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={() => {
            if (src !== FALLBACK_MEDIA) setSrc(FALLBACK_MEDIA);
          }}
        />
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 px-5 py-5 md:px-6 md:py-6">
        <div className="min-w-0">
          <h3 className="break-words text-[17px] font-bold uppercase leading-[1.25] tracking-tight text-foreground md:text-[18px]">
            {title}
          </h3>
          {description ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:opacity-90"
        >
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const locale = useLocale();
  const defaultVariant =
    product.variants?.find((variant) => variant.isDefault) ??
    product.variants?.[0];
  const image =
    defaultVariant?.imageUrl ||
    defaultVariant?.thumbUrl ||
    firstMedia(product.images);
  const optionHint = (product.options ?? [])
    .slice(0, 2)
    .map((option) => {
      const values = option.values
        .map((value) => getLocalized(value.label, locale).trim() || value.value)
        .filter(Boolean)
        .slice(0, 4);
      if (values.length === 0) return "";
      const label = getLocalized(option.label, locale).trim() || option.key;
      return `${label}: ${values.join(", ")}`;
    })
    .filter(Boolean)
    .join(" · ");

  return (
    <CatalogCard
      href={
        defaultVariant
          ? `/products/${product.slug}?v=${encodeURIComponent(defaultVariant.id)}`
          : `/products/${product.slug}`
      }
      image={image}
      title={getLocalized(product.name, locale)}
      description={
        optionHint || getLocalized(product.description, locale)
      }
      className={className}
    />
  );
}

export function ProductCardGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 *:min-w-0",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export function CollectionCard({
  collection,
  className,
  fromProductSlug,
}: {
  collection: Collection;
  className?: string;
  /** When set, collection breadcrumb continues from this product. */
  fromProductSlug?: string;
}) {
  const locale = useLocale();
  const image =
    firstMedia(collection.images, "") ||
    mediaSrc(collection.image, "") ||
    FALLBACK_MEDIA;
  const href = fromProductSlug
    ? `/collections/${collection.slug}?from=product&product=${encodeURIComponent(fromProductSlug)}`
    : `/collections/${collection.slug}`;
  const description = getLocalized(collection.description, locale).trim();

  return (
    <CatalogCard
      href={href}
      image={image}
      title={getLocalized(collection.name, locale)}
      description={description || undefined}
      className={className}
    />
  );
}

export function CollectionCardGrid({
  collections,
  className,
  fromProductSlug,
}: {
  collections: Collection[];
  className?: string;
  fromProductSlug?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 *:min-w-0",
        className,
      )}
    >
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          fromProductSlug={fromProductSlug}
        />
      ))}
    </div>
  );
}

export function CategoryCard({
  category,
  className,
}: {
  category: ProductCategory;
  className?: string;
}) {
  const locale = useLocale();

  return (
    <CatalogCard
      href={`/products/${category.slug}`}
      image={category.image}
      title={getLocalized(category.name, locale)}
      description={getLocalized(category.description, locale)}
      className={className}
    />
  );
}

export function CategoryCardGrid({
  categories,
  className,
}: {
  categories: ProductCategory[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 *:min-w-0",
        className,
      )}
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

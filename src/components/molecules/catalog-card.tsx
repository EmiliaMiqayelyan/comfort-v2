"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { getLocalized } from "@/data/catalog";
import { cn, firstMedia, mediaSrc } from "@/lib/utils";
import type { Collection, Product, ProductCategory } from "@/types";

type CatalogCardProps = {
  href: string;
  image?: string | null;
  title: string;
  description?: string;
  className?: string;
};

/** Shared card UI for products, collections, and categories. */
export function CatalogCard({
  href,
  image,
  title,
  description,
  className,
}: CatalogCardProps) {
  const resolved = mediaSrc(image, "");
  const [src, setSrc] = useState(resolved);

  useEffect(() => {
    setSrc(mediaSrc(image, ""));
  }, [image]);

  const isUpload = src.includes("/uploads/");
  const isRemote = /^https?:\/\//i.test(src);

  return (
    <Link
      href={href}
      className={cn(
        "catalog-panel catalog-shadow group flex h-full flex-col overflow-hidden rounded-[5px] transition duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[#ecece8]">
        {src ? (
          <Image
            src={src}
            alt={title}
            fill
            quality={90}
            unoptimized={isRemote || isUpload}
            className="object-contain object-center"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setSrc("")}
          />
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 px-5 py-5 md:px-6 md:py-6">
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold leading-[1.25] tracking-tight text-foreground md:text-[18px]">
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

  return (
    <CatalogCard
      href={`/products/${product.slug}`}
      image={firstMedia(product.images, "")}
      title={getLocalized(product.name, locale)}
      description={getLocalized(product.description, locale)}
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
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6",
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
  const image = firstMedia(collection.images, "") || collection.image || "";
  const href = fromProductSlug
    ? `/collections/${collection.slug}?from=product&product=${encodeURIComponent(fromProductSlug)}`
    : `/collections/${collection.slug}`;

  return (
    <CatalogCard
      href={href}
      image={image}
      title={getLocalized(collection.name, locale)}
      description={getLocalized(collection.description, locale)}
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
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6",
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
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6",
        className,
      )}
    >
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}

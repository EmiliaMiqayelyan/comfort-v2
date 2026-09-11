"use client";

import { useLocale } from "next-intl";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { getLocalized } from "@/data/catalog";
import { cn, firstMedia } from "@/lib/utils";
import type { Collection } from "@/types";

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
  const image = firstMedia(collection.images) || collection.image;
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

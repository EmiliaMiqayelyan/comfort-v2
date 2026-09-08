"use client";

import { useLocale } from "next-intl";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { getLocalized } from "@/data/catalog";
import { cn, firstMedia } from "@/lib/utils";
import type { Collection } from "@/types";

export function CollectionCard({
  collection,
  className,
}: {
  collection: Collection;
  className?: string;
}) {
  const locale = useLocale();
  const image = firstMedia(collection.images) || collection.image;

  return (
    <CatalogCard
      href={`/collections/${collection.slug}`}
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
}: {
  collections: Collection[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

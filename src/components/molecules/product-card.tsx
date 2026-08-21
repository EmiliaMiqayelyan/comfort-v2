"use client";

import { useLocale } from "next-intl";
import { CatalogCard } from "@/components/molecules/catalog-card";
import { getLocalized } from "@/data/catalog";
import { cn, firstMedia } from "@/lib/utils";
import type { Product } from "@/types";

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
      image={firstMedia(product.images)}
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
        "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

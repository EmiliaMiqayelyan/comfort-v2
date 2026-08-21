"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Download,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { ProductViewer3D } from "@/features/viewer/product-viewer-3d";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Reveal } from "@/components/molecules/reveal";
import { ProductCardGrid } from "@/components/molecules/product-card";
import { cn, formatPrice, mediaList, mediaSrc, jsonArray } from "@/lib/utils";
import { getLocalized } from "@/data/catalog";
import { useCategories, useCollections, useProducts } from "@/hooks/use-catalog";
import type { Product, ProductDownload, ProductSpec } from "@/types";

const availabilityKeys = {
  in_stock: "inStock",
  limited: "limited",
  preorder: "preorder",
} as const;

export function ProductDetailContent({ product }: { product: Product }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [activeImage, setActiveImage] = useState(0);
  const images = mediaList(product.images);
  const specs = jsonArray<ProductSpec>(product.specs);
  const downloads = jsonArray<ProductDownload>(product.downloads);
  const activeSrc = mediaSrc(images[activeImage] ?? images[0]);

  const { data: categories = [] } = useCategories();
  const { data: collections = [] } = useCollections();
  const { data: allProducts = [] } = useProducts();
  const category = categories.find((c) => c.id === product.categoryId);
  const collection = collections.find((c) => c.id === product.collectionId);
  const related = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categoryId === product.categoryId || p.collectionId === product.collectionId),
    )
    .slice(0, 4);

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6">
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#ecece8] shadow-soft">
              <Image
                src={activeSrc}
                alt={getLocalized(product.name, locale)}
                fill
                quality={95}
                unoptimized={activeSrc.startsWith("http")}
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </Reveal>

          {images.length > 1 && (
            <Reveal delay={0.1}>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => {
                  const thumb = mediaSrc(img);
                  return (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition",
                      activeImage === i
                        ? "border-foreground"
                        : "border-transparent opacity-70 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      unoptimized={thumb.startsWith("http")}
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                  );
                })}
              </div>
            </Reveal>
          )}

          <Reveal delay={0.15}>
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                {t("viewer3d")}
              </p>
              <ProductViewer3D
                modelUrl={product.modelUrl}
                height={product.height}
                depth={product.depth}
              />
            </div>
          </Reveal>
        </div>

        <div className="space-y-10">
          <Reveal>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {category && (
                  <Badge>{getLocalized(category.name, locale)}</Badge>
                )}
                {collection && (
                  <Badge>{getLocalized(collection.name, locale)}</Badge>
                )}
                <Badge className="border-accent/30 text-accent">
                  {t(availabilityKeys[product.availability])}
                </Badge>
              </div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground">
                {t("sku")}: {product.sku}
              </p>
              <h1 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
                {getLocalized(product.name, locale)}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {getLocalized(product.description, locale)}
              </p>
              <p className="display text-2xl text-foreground">
                {formatPrice(product.price, locale)}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/contact">
                  <MessageSquare className="h-4 w-4" />
                  {t("requestQuote")}
                </Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
                {t("specs")}
              </h2>
              <dl className="divide-y divide-border rounded-3xl border border-border bg-card">
                {specs.map((spec) => (
                  <div
                    key={spec.key}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {getLocalized(spec.label, locale)}
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {spec.value}
                      {spec.unit ? ` ${spec.unit}` : ""}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <dt className="text-sm text-muted-foreground">{t("material")}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {product.material}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <dt className="text-sm text-muted-foreground">{t("finish")}</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {product.finish}
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          {downloads.length > 0 && (
            <Reveal delay={0.2}>
              <div>
                <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
                  {t("downloads")}
                </h2>
                <ul className="space-y-3">
                  {downloads.map((file) => (
                    <li key={file.id}>
                      <a
                        href={file.url}
                        download
                        className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition hover:border-foreground/20 hover:shadow-soft"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          {file.type === "pdf" ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {getLocalized(file.label, locale)}
                          </span>
                          {file.size && (
                            <span className="text-xs text-muted-foreground">
                              {file.size}
                            </span>
                          )}
                        </span>
                        <Badge>{file.type.toUpperCase()}</Badge>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-border pt-24">
          <Reveal>
            <h2 className="display mb-12 text-2xl text-foreground md:text-3xl">
              {t("related")}
            </h2>
          </Reveal>
          <ProductCardGrid products={related} />
        </section>
      )}
    </>
  );
}

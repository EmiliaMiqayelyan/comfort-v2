"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { Badge } from "@/components/atoms/badge";
import { getLocalized } from "@/data/catalog";
import {
  useCategories,
  useCollections,
  useProducts,
} from "@/hooks/use-catalog";
import { parentCategories, productsInCategory } from "@/lib/category-tree";
import { cn, firstMedia, mediaSrc } from "@/lib/utils";

const ALL = "all";

export function CollectionsGrid() {
  const t = useTranslations("collections");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [activeCategoryId, setActiveCategoryId] = useState<string>(ALL);
  const { data: collections = [] } = useCollections();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const parents = useMemo(() => parentCategories(categories), [categories]);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const filtered = useMemo(() => {
    if (activeCategoryId === ALL) return collections;

    const matchingCollectionIds = new Set<string>();
    for (const product of products) {
      if (!productsInCategory(activeCategoryId, categories, product.categoryId)) {
        continue;
      }
      if (product.collectionIds?.length) {
        for (const id of product.collectionIds) matchingCollectionIds.add(id);
      } else if (product.collectionId) {
        matchingCollectionIds.add(product.collectionId);
      }
    }

    return collections.filter((col) => matchingCollectionIds.has(col.id));
  }, [activeCategoryId, categories, collections, products]);

  const showSlider = parents.length > 0;

  return (
    <>
      {showSlider ? (
        <Reveal className="mb-12">
          <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
            {t("byCategory")}
          </h2>
          <div className="collections-swiper relative">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.35}
              watchOverflow
              pagination={{ clickable: true }}
              breakpoints={{
                480: { slidesPerView: 2.2, spaceBetween: 16 },
                768: { slidesPerView: 3.2, spaceBetween: 18 },
                1024: { slidesPerView: 4.25, spaceBetween: 20 },
              }}
              onBeforeInit={(swiper) => {
                const navigation = swiper.params.navigation;
                if (navigation && typeof navigation !== "boolean") {
                  navigation.prevEl = prevRef.current;
                  navigation.nextEl = nextRef.current;
                }
              }}
              onSwiper={(swiper) => {
                if (
                  swiper.params.navigation &&
                  typeof swiper.params.navigation !== "boolean"
                ) {
                  swiper.params.navigation.prevEl = prevRef.current;
                  swiper.params.navigation.nextEl = nextRef.current;
                }
                swiper.navigation.init();
                swiper.navigation.update();
              }}
              className="pb-12"
            >
              <SwiperSlide className="!h-auto">
                <CategoryFilterCard
                  selected={activeCategoryId === ALL}
                  onSelect={() => setActiveCategoryId(ALL)}
                  title={tc("all")}
                  icon
                />
              </SwiperSlide>
              {parents.map((category) => (
                <SwiperSlide key={category.id} className="!h-auto">
                  <CategoryFilterCard
                    selected={activeCategoryId === category.id}
                    onSelect={() => setActiveCategoryId(category.id)}
                    title={getLocalized(category.name, locale)}
                    image={category.image}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              ref={prevRef}
              type="button"
              aria-label="Previous"
              className="collections-swiper-nav absolute top-[38%] left-0 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_8px_24px_rgba(17,24,39,0.12)] transition hover:bg-white/95 md:h-12 md:w-12"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              ref={nextRef}
              type="button"
              aria-label="Next"
              className="collections-swiper-nav absolute top-[38%] right-0 z-10 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_8px_24px_rgba(17,24,39,0.12)] transition hover:bg-white/95 md:h-12 md:w-12"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </Reveal>
      ) : null}

      <Reveal className="mb-8">
        <p className="text-sm text-muted-foreground">
          {t("results", { count: filtered.length })}
        </p>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((collection, i) => (
          <Reveal key={collection.id} delay={i * 0.06}>
            <Link
              href={`/collections/${collection.slug}`}
              className="catalog-panel catalog-shadow group relative flex flex-col overflow-hidden rounded-3xl border transition hover:-translate-y-0.5"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ecece8]">
                <Image
                  src={mediaSrc(firstMedia(collection.images) || collection.image)}
                  alt={getLocalized(collection.name, locale)}
                  fill
                  quality={95}
                  className="catalog-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                <Badge className="absolute left-4 top-4 border-white/20 bg-background/80 capitalize backdrop-blur">
                  {collection.style}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-6 md:p-8">
                <h3 className="display text-xl text-foreground md:text-2xl">
                  {getLocalized(collection.name, locale)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {getLocalized(collection.description, locale)}
                </p>
                <p className="mt-auto pt-4 text-xs uppercase tracking-widest text-muted-foreground">
                  {t("products", { count: collection.productCount })}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}

function CategoryFilterCard({
  selected,
  onSelect,
  title,
  image,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  image?: string | null;
  icon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "catalog-panel group flex h-full w-full flex-col overflow-hidden rounded-[5px] border text-left transition duration-300",
        selected
          ? "border-foreground shadow-[0_0_0_1px_var(--foreground)]"
          : "hover:-translate-y-0.5 hover:border-foreground/30",
      )}
    >
      <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-[#ecece8]">
        {icon ? (
          <div className="flex h-full w-full items-center justify-center bg-secondary/80">
            <LayoutGrid
              className={cn(
                "h-10 w-10 transition",
                selected ? "text-foreground" : "text-muted-foreground",
              )}
              strokeWidth={1.25}
            />
          </div>
        ) : (
          <Image
            src={mediaSrc(image)}
            alt=""
            fill
            quality={90}
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 70vw, 25vw"
          />
        )}
      </div>
      <div className="px-4 py-4 md:px-5">
        <span
          className={cn(
            "text-[15px] font-bold leading-snug tracking-tight md:text-[16px]",
            selected ? "text-foreground" : "text-foreground/90",
          )}
        >
          {title}
        </span>
      </div>
    </button>
  );
}

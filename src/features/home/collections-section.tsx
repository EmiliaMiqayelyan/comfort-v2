"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/molecules/reveal";
import { CollectionCard } from "@/components/molecules/collection-card";
import { useCollections } from "@/hooks/use-catalog";

export function CollectionsSection() {
  const t = useTranslations("collections");
  const { data: collections = [], isLoading } = useCollections();
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (isLoading || collections.length === 0) return null;

  const showSlider = collections.length > 1;

  return (
    <section className="overflow-x-clip bg-secondary/50 py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-3xl text-foreground md:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 text-sm tracking-wide text-muted-foreground transition hover:text-accent"
          >
            {t("viewAll")}
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        {!showSlider ? (
          <Reveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <CollectionCard collection={collections[0]} />
          </Reveal>
        ) : (
          <Reveal>
            <div className="collections-swiper relative">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                watchOverflow
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 4, spaceBetween: 24 },
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
                {collections.map((collection) => (
                  <SwiperSlide key={collection.id} className="!h-auto">
                    <CollectionCard
                      collection={collection}
                      className="h-full"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button
                ref={prevRef}
                type="button"
                aria-label="Previous"
                className="collections-swiper-nav absolute top-[26%] left-0 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_8px_24px_rgba(17,24,39,0.12)] transition hover:bg-white/95 md:h-14 md:w-14"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.75} />
              </button>
              <button
                ref={nextRef}
                type="button"
                aria-label="Next"
                className="collections-swiper-nav absolute top-[26%] right-0 z-10 flex h-12 w-12 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-[0_8px_24px_rgba(17,24,39,0.12)] transition hover:bg-white/95 md:h-14 md:w-14"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.75} />
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

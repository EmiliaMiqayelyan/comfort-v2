"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { cn } from "@/lib/utils";

type ChipSwiperProps = {
  children: ReactNode;
  className?: string;
  slideClassName?: string;
  spaceBetween?: number;
  initialSlide?: number;
  wrapperTag?: string;
  slideTag?: string;
};

/** Room for `ring-2 ring-offset-1` selection rings, which `.swiper { overflow: hidden }` would clip. */
const THUMB_SWIPER_CLASS = "!-mx-[3px] !w-[calc(100%+6px)] !p-[3px]";

/** Horizontal free-scrolling row of auto-width items (breadcrumbs, swatches, chips). */
export function ChipSwiper({
  children,
  className,
  slideClassName,
  spaceBetween = 8,
  initialSlide = 0,
  wrapperTag,
  slideTag,
}: ChipSwiperProps) {
  const items = Children.toArray(children);

  return (
    <Swiper
      modules={[FreeMode, Mousewheel]}
      slidesPerView="auto"
      spaceBetween={spaceBetween}
      initialSlide={initialSlide}
      freeMode={{ enabled: true, sticky: false }}
      mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
      watchOverflow
      grabCursor
      wrapperTag={wrapperTag}
      className={cn("!mx-0 w-full", className)}
    >
      {items.map((item, index) => (
        <SwiperSlide
          key={isValidElement(item) && item.key != null ? item.key : index}
          tag={slideTag}
          className={cn("!w-auto", slideClassName)}
        >
          {item}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

/** Swatch/thumbnail row: swiper below `lg`, wrapping grid from `lg` up. */
export function SwatchRow({
  children,
  initialSlide = 0,
}: {
  children: ReactNode;
  initialSlide?: number;
}) {
  return (
    <>
      <div className="lg:hidden">
        <ChipSwiper
          spaceBetween={8}
          initialSlide={initialSlide}
          className={THUMB_SWIPER_CLASS}
        >
          {children}
        </ChipSwiper>
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">{children}</div>
    </>
  );
}

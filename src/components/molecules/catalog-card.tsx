"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, FALLBACK_MEDIA, mediaSrc } from "@/lib/utils";

type CatalogCardProps = {
  href: string;
  image?: string | null;
  title: string;
  description: string;
  className?: string;
};

export function CatalogCard({
  href,
  image,
  title,
  description,
  className,
}: CatalogCardProps) {
  const src = mediaSrc(image);
  const isPlaceholder = src === FALLBACK_MEDIA || src.includes("/products/plinth.png");

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[7px] bg-[#f3f3f1] shadow-[0_1px_0_rgba(17,24,39,0.04)] transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#ecece8]">
        <Image
          src={src}
          alt={title}
          fill
          quality={95}
          unoptimized={src.startsWith("http")}
          className={cn("catalog-cover", isPlaceholder && "catalog-cover--plinth")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 280px"
        />
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 px-5 py-5 md:px-6 md:py-6">
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold leading-[1.25] tracking-tight text-[#111111]">
            {title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-[#555555]">
            {description}
          </p>
        </div>

        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1c20] text-white transition-colors group-hover:bg-[#111111]"
        >
          <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

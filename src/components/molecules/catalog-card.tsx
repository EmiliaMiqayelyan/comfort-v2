"use client";

import { useEffect, useState } from "react";
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
  const resolved = mediaSrc(image);
  const [src, setSrc] = useState(resolved);

  useEffect(() => {
    setSrc(mediaSrc(image));
  }, [image]);

  const isUpload = src.includes("/uploads/");
  const isRemote = /^https?:\/\//i.test(src);

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[5px] bg-[#f3f3f1] shadow-[0_1px_0_rgba(17,24,39,0.04)] transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-[#ecece8]">
        <Image
          src={src}
          alt={title}
          fill
          quality={90}
          unoptimized={isRemote || isUpload}
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          onError={() => {
            if (src !== FALLBACK_MEDIA) setSrc(FALLBACK_MEDIA);
          }}
        />
      </div>

      <div className="flex flex-1 items-center justify-between gap-4 px-5 py-5 md:px-6 md:py-6">
        <div className="min-w-0">
          <h3 className="text-[17px] font-bold leading-[1.25] tracking-tight text-[#111111] md:text-[18px]">
            {title}
          </h3>
          {description ? (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-[#555555]">
              {description}
            </p>
          ) : null}
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

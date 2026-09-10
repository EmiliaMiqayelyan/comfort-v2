"use client";

import { useLocale } from "next-intl";
import { getLocalized } from "@/data/catalog";
import type { Partner } from "@/types";
import { cn } from "@/lib/utils";

const MARQUEE_THRESHOLD = 5;

type PartnersMarqueeProps = {
  partners: Partner[];
  className?: string;
};

function PartnerLogo({
  partner,
  locale,
}: {
  partner: Partner;
  locale: string;
}) {
  const title = getLocalized(partner.title, locale) || "Partner";
  const logo = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={partner.logo}
      alt={title}
      className="max-h-14 w-auto max-w-[140px] object-contain sm:max-h-16 sm:max-w-[160px]"
      loading="lazy"
      decoding="async"
    />
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-20 w-40 shrink-0 items-center justify-center px-4 opacity-80 transition hover:opacity-100"
        title={title}
      >
        {logo}
      </a>
    );
  }

  return (
    <div
      className="flex h-20 w-40 shrink-0 items-center justify-center px-4 opacity-80"
      title={title}
    >
      {logo}
    </div>
  );
}

export function PartnersMarquee({
  partners,
  className,
}: PartnersMarqueeProps) {
  const locale = useLocale();

  if (partners.length === 0) {
    return null;
  }

  const useMarquee = partners.length >= MARQUEE_THRESHOLD;
  // Keep motion readable for long lists: ~2.5s per logo, clamped.
  const durationSec = Math.min(90, Math.max(24, partners.length * 2.5));

  if (!useMarquee) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-8 gap-y-6",
          className,
        )}
      >
        {partners.map((partner) => (
          <PartnerLogo key={partner.id} partner={partner} locale={locale} />
        ))}
      </div>
    );
  }

  // Build one half wide enough for large viewports, then duplicate for a seamless -50% loop.
  let half = [...partners];
  while (half.length < 8) {
    half = [...half, ...partners];
  }
  const track = [...half, ...half];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-muted/30 to-transparent md:w-20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-muted/30 to-transparent md:w-20"
        aria-hidden
      />
      <div
        className="partners-marquee flex w-max items-center"
        style={{ ["--marquee-duration" as string]: `${durationSec}s` }}
      >
        {track.map((partner, index) => (
          <PartnerLogo
            key={`${partner.id}-${index}`}
            partner={partner}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}

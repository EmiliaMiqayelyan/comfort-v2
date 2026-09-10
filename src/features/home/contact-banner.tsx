"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Clock, Phone, Mail, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { Reveal } from "@/components/molecules/reveal";
import { catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import type { ContactSettings } from "@/types";

function safeMapEmbedUrl(url: string | undefined | null): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function ContactBanner() {
  const t = useTranslations("contact");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const [settings, setSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    catalogApi.contactSettings().then(setSettings);
  }, []);

  const address = settings ? getLocalized(settings.address, locale) : "";
  const hours = settings ? getLocalized(settings.hours, locale) : "";
  const phones = (settings?.phones ?? []).filter(Boolean);
  const emails = (settings?.emails ?? []).filter(Boolean);
  const mapUrl = safeMapEmbedUrl(settings?.mapEmbedUrl);
  const showrooms = settings?.showrooms ?? [];

  return (
    <section className="bg-comfort-ink py-16 md:py-20">
      <div className="container-wide px-4 md:px-8">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 lg:items-center">
            <div>
              <p className="mb-4 text-xs font-medium tracking-[0.2em] uppercase text-comfort-sand/70">
                Comfort
              </p>
              <h2 className="display text-balance text-3xl text-comfort-sand md:text-4xl lg:text-5xl">
                {t("bannerTitle")}
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-comfort-sand/75 md:text-lg">
                {t("bannerSubtitle")}
              </p>

              <div className="mt-8 space-y-4">
                {address && (
                  <p className="flex items-start gap-3 text-sm text-comfort-sand/85 md:text-base">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-comfort-sand/60" />
                    <span>
                      <span className="mb-0.5 block text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                        {t("address")}
                      </span>
                      {address}
                    </span>
                  </p>
                )}
                {hours && (
                  <p className="flex items-start gap-3 text-sm text-comfort-sand/85 md:text-base">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-comfort-sand/60" />
                    <span>
                      <span className="mb-0.5 block text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                        {t("hours")}
                      </span>
                      {hours}
                    </span>
                  </p>
                )}
                {phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-start gap-3 text-sm text-comfort-sand/85 transition hover:text-comfort-sand md:text-base"
                  >
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-comfort-sand/60" />
                    <span>
                      <span className="mb-0.5 block text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                        {t("phone")}
                      </span>
                      {phone}
                    </span>
                  </a>
                ))}
                {emails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="flex items-start gap-3 text-sm text-comfort-sand/85 transition hover:text-comfort-sand md:text-base"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-comfort-sand/60" />
                    <span>
                      <span className="mb-0.5 block text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                        {t("email")}
                      </span>
                      {email}
                    </span>
                  </a>
                ))}
              </div>

              {showrooms.length > 0 && (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="mb-3 text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                    {t("showrooms")}
                  </p>
                  <ul className="space-y-3">
                    {showrooms.map((room) => (
                      <li key={room.id} className="text-sm text-comfort-sand/80">
                        <span className="font-medium text-comfort-sand">{room.name}</span>
                        {room.address && (
                          <span className="mt-0.5 block text-comfort-sand/65">{room.address}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                asChild
                variant="secondary"
                size="lg"
                className="mt-8 border-comfort-sand/20 bg-comfort-sand text-comfort-ink hover:bg-comfort-sand/90"
              >
                <Link href="/contact">
                  {nav("contactCta")}
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>

            {mapUrl && (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-soft">
                <iframe
                  title={t("map")}
                  src={mapUrl}
                  className="h-72 w-full border-0 md:h-[28rem]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

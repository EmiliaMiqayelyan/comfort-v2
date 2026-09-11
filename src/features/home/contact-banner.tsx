"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Clock, Phone, Mail, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { SocialIcon } from "@/components/atoms/social-icon";
import { Reveal } from "@/components/molecules/reveal";
import { BrandMap } from "@/components/molecules/brand-map";
import { catalogApi } from "@/lib/api";
import { locationQuery } from "@/lib/maps";
import { getLocalized } from "@/data/catalog";
import type { ContactSettings } from "@/types";

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
  const socials = (settings?.socials ?? []).filter((item) => item.href);
  const mapQuery = locationQuery(settings?.mapEmbedUrl, address);
  const showrooms = settings?.showrooms ?? [];

  return (
    <section className="bg-comfort-ink py-12 md:py-16">
      <div className="container-wide px-4 md:px-8">
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch lg:gap-10">
            <div className="flex flex-col">
              <p className="mb-3 text-xs font-medium tracking-[0.2em] uppercase text-comfort-sand/70">
                Comfort
              </p>
              <h2 className="display text-balance text-2xl text-comfort-sand md:text-3xl lg:text-4xl">
                {t("bannerTitle")}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-comfort-sand/75 md:text-base">
                {t("bannerSubtitle")}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {address && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                    <p className="mb-1.5 flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                      <MapPin className="h-3.5 w-3.5" />
                      {t("address")}
                    </p>
                    <p className="text-sm leading-relaxed text-comfort-sand/90">{address}</p>
                  </div>
                )}
                {hours && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5">
                    <p className="mb-1.5 flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                      <Clock className="h-3.5 w-3.5" />
                      {t("hours")}
                    </p>
                    <p className="text-sm leading-relaxed text-comfort-sand/90">{hours}</p>
                  </div>
                )}
                {phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 transition hover:border-comfort-sand/30 hover:bg-white/[0.07]"
                  >
                    <p className="mb-1.5 flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                      <Phone className="h-3.5 w-3.5" />
                      {t("phone")}
                    </p>
                    <p className="text-sm text-comfort-sand/90">{phone}</p>
                  </a>
                ))}
                {emails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 transition hover:border-comfort-sand/30 hover:bg-white/[0.07]"
                  >
                    <p className="mb-1.5 flex items-center gap-2 text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                      <Mail className="h-3.5 w-3.5" />
                      {t("email")}
                    </p>
                    <p className="text-sm text-comfort-sand/90">{email}</p>
                  </a>
                ))}
              </div>

              {showrooms.length > 0 && (
                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-comfort-sand/50">
                    {t("showrooms")}
                  </p>
                  {showrooms.map((room) => (
                    <div
                      key={room.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <p className="text-sm font-medium text-comfort-sand">{room.name}</p>
                      {room.address && (
                        <p className="mt-1 flex items-start gap-2 text-xs text-comfort-sand/65">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          {room.address}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-comfort-sand/65">
                        {room.hours && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {room.hours}
                          </span>
                        )}
                        {room.phone && (
                          <a
                            href={`tel:${room.phone.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-1.5 transition hover:text-comfort-sand"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {room.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {socials.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {socials.map((item) => (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-comfort-sand/85 transition hover:border-comfort-sand/40 hover:text-comfort-sand"
                    >
                      <SocialIcon id={item.id} label={item.label} href={item.href} />
                      {item.label}
                    </a>
                  ))}
                </div>
              )}

              <Button
                asChild
                variant="secondary"
                className="mt-6 w-fit border-comfort-sand/20 bg-comfort-sand text-comfort-ink hover:bg-comfort-sand/90"
              >
                <Link href="/contact">
                  {nav("contactCta")}
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>

            {mapQuery && (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-soft lg:max-h-[320px]">
                <BrandMap
                  title={t("map")}
                  address={address}
                  embedUrl={settings?.mapEmbedUrl}
                  className="h-52 w-full sm:h-60 lg:h-full lg:min-h-[280px]"
                  zoom={16}
                />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { SocialIcon } from "@/components/atoms/social-icon";
import { BrandMap } from "@/components/molecules/brand-map";
import { catalogApi } from "@/lib/api";
import { locationQuery } from "@/lib/maps";
import { getLocalized } from "@/data/catalog";
import type { ContactSettings, LocalizedString } from "@/types";

function pickLocalized(
  value: LocalizedString | undefined,
  locale: string,
  fallback: string,
) {
  const text = getLocalized(value, locale).trim();
  return text || fallback;
}

function useContactSettings() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    catalogApi.contactSettings().then(setSettings);
  }, []);

  return settings;
}

export function ContactIntro() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const settings = useContactSettings();

  const title = pickLocalized(settings?.title, locale, t("title"));
  const subtitle = pickLocalized(settings?.subtitle, locale, t("subtitle"));

  return (
    <>
      <h1 className="display text-4xl text-foreground md:text-5xl lg:text-6xl">
        {title}
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
    </>
  );
}

export function ContactDetails() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const settings = useContactSettings();

  if (!settings) return null;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
          {t("showrooms")}
        </h2>
        <ul className="space-y-6">
          {(settings.showrooms ?? []).map((room) => {
            const roomQuery = locationQuery(room.mapEmbedUrl, room.address);
            return (
              <li key={room.id} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <h3 className="font-medium text-foreground">{room.name}</h3>
                <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {room.address}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  {room.hours}
                </p>
                {room.phone && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    {room.phone}
                  </p>
                )}
                {roomQuery && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                    <BrandMap
                      title={`${room.name} map`}
                      address={room.address}
                      embedUrl={room.mapEmbedUrl}
                      className="h-44 w-full"
                      interactive={false}
                      zoom={17}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          {getLocalized(settings.address, locale)}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 shrink-0" />
          {getLocalized(settings.hours, locale)}
        </p>
        {(settings.phones ?? []).filter(Boolean).map((phone) => (
          <p key={phone} className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            {phone}
          </p>
        ))}
        {(settings.emails ?? []).filter(Boolean).map((email) => (
          <p key={email} className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            {email}
          </p>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {(settings.socials ?? []).filter((item) => item.href).map((item) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
          >
            <SocialIcon id={item.id} label={item.label} href={item.href} />
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function ContactMap() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const settings = useContactSettings();

  const address = settings ? getLocalized(settings.address, locale) : "";
  const query = locationQuery(settings?.mapEmbedUrl, address);

  if (!query) return null;

  return (
    <div className="mt-16 md:mt-20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="display text-xl text-foreground md:text-2xl">
            {t("warehouseMap")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {t("warehouseMapSubtitle")}
          </p>
        </div>
        {address && (
          <p className="inline-flex items-start gap-2 text-sm text-muted-foreground sm:max-w-xs sm:text-right">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              <span className="mb-0.5 block text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground/80">
                {t("warehouse")}
              </span>
              {address}
            </span>
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <BrandMap
          title={t("warehouseMap")}
          address={address}
          embedUrl={settings?.mapEmbedUrl}
          className="h-72 w-full md:h-[28rem]"
          zoom={16}
        />
      </div>
    </div>
  );
}

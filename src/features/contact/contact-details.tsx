"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { SocialIcon } from "@/components/atoms/social-icon";
import { catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import type { ContactSettings, LocalizedString } from "@/types";

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
            const roomMap = safeMapEmbedUrl(room.mapEmbedUrl);
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
                {roomMap && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border">
                    <iframe
                      title={`${room.name} map`}
                      src={roomMap}
                      className="h-44 w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
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
  const settings = useContactSettings();
  const mapUrl = safeMapEmbedUrl(settings?.mapEmbedUrl);

  if (!mapUrl) return null;

  return (
    <div className="mt-16 md:mt-20">
      <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
        {t("map")}
      </h2>
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <iframe
          title={t("map")}
          src={mapUrl}
          className="h-72 w-full border-0 md:h-[28rem]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}

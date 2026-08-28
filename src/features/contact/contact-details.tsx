"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import type { ContactSettings } from "@/types";

export function ContactDetails() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const [settings, setSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    catalogApi.contactSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="display mb-6 text-xl text-foreground md:text-2xl">
          {t("showrooms")}
        </h2>
        <ul className="space-y-6">
          {(settings.showrooms ?? []).map((room) => (
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
            </li>
          ))}
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
            className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

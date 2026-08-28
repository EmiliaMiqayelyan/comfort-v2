"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Separator } from "@/components/atoms/separator";
import { BrandLogo } from "@/components/atoms/brand-logo";
import { catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import type { ContactSettings } from "@/types";

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const [settings, setSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    catalogApi.contactSettings().then(setSettings);
  }, []);

  return (
    <footer className="border-t border-border bg-comfort-ink text-comfort-sand">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="mb-5">
            <BrandLogo heightClassName="h-14" inverted />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-comfort-sand/80">
            {t("mission")}
          </p>
          {settings && (
            <div className="mt-6 space-y-2 text-sm text-comfort-sand/80">
              {(settings.phones ?? []).filter(Boolean).map((phone) => (
                <p key={phone}>{phone}</p>
              ))}
              {(settings.emails ?? []).filter(Boolean).map((email) => (
                <p key={email}>{email}</p>
              ))}
              <p>{getLocalized(settings.address, locale)}</p>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {(settings?.socials ?? []).filter((item) => item.href).map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-comfort-sand/85 transition hover:border-comfort-sand/50 hover:text-comfort-sand"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-4">
          <FooterCol title={t("products")}>
            <Link href="/products">{nav("products")}</Link>
            <Link href="/collections">{nav("collections")}</Link>
          </FooterCol>
          <FooterCol title={t("company")}>
            <Link href="/about">{nav("about")}</Link>
            <Link href="/production">{nav("production")}</Link>
            <Link href="/partners">{nav("partners")}</Link>
            <Link href="/blog">{nav("blog")}</Link>
          </FooterCol>
          <FooterCol title={t("support")}>
            <Link href="/downloads">{nav("downloads")}</Link>
            <Link href="/contact">{nav("contact")}</Link>
            <a
              href="https://www.comfort.am"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1"
            >
              {nav("oldSite")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </FooterCol>
          <FooterCol title={t("legal")}>
            <Link href="/legal/privacy">{t("privacy")}</Link>
            <Link href="/legal/terms">{t("terms")}</Link>
            <Link href="/legal/cookies">{t("cookies")}</Link>
          </FooterCol>
        </div>
      </div>

      <Separator className="bg-white/10" />
      <div className="container-wide flex flex-col gap-2 py-6 text-xs text-comfort-sand/65 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Comfort. {t("rights")}
        </p>
        <p>comfort.am</p>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-medium tracking-[0.2em] uppercase text-comfort-sand">
        {title}
      </h3>
      <div className="flex flex-col gap-3 text-sm text-comfort-sand/75 [&_a]:transition hover:[&_a]:text-white">
        {children}
      </div>
    </div>
  );
}

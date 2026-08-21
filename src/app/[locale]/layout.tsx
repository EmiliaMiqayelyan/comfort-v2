import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AppProviders } from "@/components/providers/app-providers";
import { LocaleShell } from "@/components/providers/locale-shell";
import { SiteHeader } from "@/components/organisms/site-header";
import { SiteFooter } from "@/components/organisms/site-footer";
import { LoadingScreen } from "@/components/organisms/loading-screen";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OrganizationJsonLd />
      <AppProviders>
        <LocaleShell
          header={
            <>
              <LoadingScreen />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2"
              >
                Skip to content
              </a>
              <SiteHeader />
            </>
          }
          footer={<SiteFooter />}
        >
          {children}
        </LocaleShell>
      </AppProviders>
    </NextIntlClientProvider>
  );
}

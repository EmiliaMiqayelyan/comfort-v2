import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });
  return {
    title: `${t("cookies")} — Comfort`,
    alternates: {
      canonical: `https://comfort.am/${locale}/legal/cookies`,
    },
  };
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mx-auto max-w-3xl">
          <h1 className="display text-4xl text-foreground md:text-5xl">
            {t("cookies")}
          </h1>
          <div className="mt-10 space-y-6 text-muted-foreground">
            <p>
              Comfort uses cookies and similar technologies to improve website
              performance, remember preferences, and analyze traffic patterns.
            </p>
            <p>
              Essential cookies are required for core functionality such as
              language selection and form security. Analytics cookies help us
              understand how visitors use our tools and catalog.
            </p>
            <p>
              You can manage cookie preferences through your browser settings at
              any time.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

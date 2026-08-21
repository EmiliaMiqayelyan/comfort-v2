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
    title: `${t("terms")} — Comfort`,
    alternates: {
      canonical: `https://comfort.am/${locale}/legal/terms`,
    },
  };
}

export default async function TermsPage({
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
            {t("terms")}
          </h1>
          <div className="mt-10 space-y-6 text-muted-foreground">
            <p>
              By using the Comfort website, you agree to these terms of use. All
              product information, imagery, and technical data are provided for
              reference and may change without notice.
            </p>
            <p>
              Comfort trademarks, catalog content, and digital tools remain the
              property of Comfort. Unauthorized reproduction or distribution is
              prohibited.
            </p>
            <p>
              Product availability, pricing, and specifications are subject to
              confirmation by our sales team.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

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
    title: `${t("privacy")} — Comfort`,
    alternates: {
      canonical: `https://comfort.am/${locale}/legal/privacy`,
    },
  };
}

export default async function PrivacyPage({
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
            {t("privacy")}
          </h1>
          <div className="mt-10 space-y-6 text-muted-foreground">
            <p>
              Comfort respects your privacy. This policy describes how we collect,
              use, and protect personal information when you visit our website or
              contact our team.
            </p>
            <p>
              We process data submitted through contact forms solely to respond to
              inquiries and provide requested services. We do not sell personal data
              to third parties.
            </p>
            <p>
              For questions regarding data protection, please contact us through
              the contact page.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

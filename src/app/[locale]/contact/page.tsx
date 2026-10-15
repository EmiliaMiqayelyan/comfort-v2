import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/molecules/reveal";
import { ContactForm } from "@/features/contact/contact-form";
import { ContactDetails, ContactIntro, ContactMap } from "@/features/contact/contact-details";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const tContact = await getTranslations({ locale, namespace: "contact" });
  return buildPageMetadata({
    locale,
    path: "/contact",
    title: t("contactTitle"),
    description: t.has("contactDescription")
      ? t("contactDescription")
      : tContact("subtitle"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container-wide px-4 md:px-8">
        <Reveal className="mb-16 max-w-3xl">
          <ContactIntro />
        </Reveal>

        <div className="grid gap-16 lg:grid-cols-5 lg:gap-20">
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          <div className="lg:col-span-2">
            <ContactDetails />
          </div>
        </div>

        <ContactMap />
      </div>
    </section>
  );
}

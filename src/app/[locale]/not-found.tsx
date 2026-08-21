"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-24">
      <div className="mx-auto max-w-lg text-center">
        <p className="display text-sm tracking-[0.3em] uppercase text-accent">404</p>
        <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">
          {t("error")}
        </h1>
        <p className="mt-4 text-muted-foreground">{t("retry")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="accent">
            <Link href="/">{t("back")}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/products">{t("view")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

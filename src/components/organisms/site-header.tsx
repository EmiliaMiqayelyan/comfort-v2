"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useTranslations } from "next-intl";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";
import { BrandLogo } from "@/components/atoms/brand-logo";
import { HeaderNav } from "@/components/molecules/header-nav";
import { LocaleSelect } from "@/components/molecules/locale-select";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores";

const mobileExtra = [
  { key: "production" as const, href: "/production" },
  { key: "blog" as const, href: "/blog" },
  { key: "partners" as const, href: "/partners" },
];

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { mobileNavOpen, setMobileNavOpen } = useUiStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24 || !isHome);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const solid = scrolled || !isHome || mobileNavOpen;
  const closeMobile = () => setMobileNavOpen(false);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        mobileNavOpen
          ? "flex h-dvh max-h-dvh flex-col overflow-hidden glass"
          : solid
            ? "glass border-b border-border/60 py-3 shadow-soft"
            : "bg-transparent py-5",
      )}
    >
      <div
        className={cn(
          "container-wide flex items-center justify-between gap-4",
          mobileNavOpen && "shrink-0 border-b border-border/60 py-3",
        )}
      >
        <Link href="/" className="shrink-0 transition hover:opacity-90">
          <BrandLogo
            heightClassName="h-12 md:h-14"
            inverted={!solid}
            className={cn(solid && "dark:brightness-0 dark:invert")}
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          <HeaderNav solid={solid} />
          <a
            href="https://www.comfort.am"
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center gap-1 text-[15px] tracking-wide transition-colors",
              solid
                ? "text-foreground/90 hover:text-accent"
                : "text-white/90 hover:text-white",
            )}
          >
            {t("oldSite")}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LocaleSelect inverted={!solid} />
          </div>

          <ThemeToggle inverted={!solid} />

          <Button
            asChild
            variant={solid ? "accent" : "glass"}
            size="sm"
            className="hidden text-sm md:inline-flex"
          >
            <Link href="/contact">
              {t("contactCta")}
              <ArrowUpRight />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("lg:hidden", !solid && "text-white hover:bg-white/10")}
            aria-label="Menu"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            {mobileNavOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain px-6 py-6 lg:hidden"
            data-lenis-prevent
          >
            <div className="flex min-h-full flex-col gap-4">
              <HeaderNav
                solid
                variant="mobile"
                onNavigate={closeMobile}
              />
              {mobileExtra.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-base text-muted-foreground"
                  onClick={closeMobile}
                >
                  {t(item.key)}
                </Link>
              ))}
              <a
                href="https://www.comfort.am"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-base text-muted-foreground"
              >
                {t("oldSite")}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <div className="mt-auto flex items-center justify-start gap-1 pt-6">
                <ThemeToggle />
                <LocaleSelect onChange={closeMobile} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

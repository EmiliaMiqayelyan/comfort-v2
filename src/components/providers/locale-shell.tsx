"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "@/i18n/routing";

export function LocaleShell({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const root = document.documentElement;
    const { body } = document;

    if (isAdmin) {
      root.classList.add("admin-scroll-lock");
      root.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.height = "100dvh";
    } else {
      root.classList.remove("admin-scroll-lock");
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.height = "";
    }

    return () => {
      root.classList.remove("admin-scroll-lock");
      root.style.overflow = "";
      body.style.overflow = "";
      body.style.height = "";
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <div className="h-dvh overflow-hidden">{children}</div>;
  }

  return (
    <>
      {header}
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      {footer}
    </>
  );
}

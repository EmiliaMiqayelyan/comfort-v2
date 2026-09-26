"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "@/i18n/routing";

/**
 * Native document scroll. Formerly Lenis — removed because its RAF loop
 * caused scroll jank on image-heavy catalog pages.
 * Still scrolls to top on route change (Next.js alone is not always enough
 * after client navigations with sticky headers).
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    const reset = () => window.scrollTo(0, 0);
    reset();
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, [pathname, isAdmin]);

  return <>{children}</>;
}

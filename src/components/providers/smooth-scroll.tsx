"use client";

import "lenis/dist/lenis.css";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "@/i18n/routing";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const lenisRef = useRef<LenisRef>(null);

  // Lenis owns document scroll, so Next.js default scroll-to-top on navigation
  // does not stick - reset explicitly whenever the route changes.
  useEffect(() => {
    if (isAdmin) return;

    const reset = () => {
      lenisRef.current?.lenis?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };

    reset();
    // Re-run after paint in case Lenis was not ready on the first tick.
    const frame = requestAnimationFrame(reset);
    return () => cancelAnimationFrame(frame);
  }, [pathname, isAdmin]);

  // Admin uses its own pane scrolling - Lenis on the document causes double scrollbars.
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        // Snappier than a low lerp so wheel/trackpad feels less “stuck”
        // on image-heavy catalog pages.
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
        autoRaf: true,
        autoResize: true,
        touchMultiplier: 1.5,
        wheelMultiplier: 1,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

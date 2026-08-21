"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { usePathname } from "@/i18n/routing";

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  // Admin uses its own pane scrolling — Lenis on the document causes double scrollbars.
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

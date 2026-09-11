import type { Metadata } from "next";

/**
 * Admin shell fills the viewport. Body scroll is locked by LocaleShell.
 * Only the sidebar nav and main content panes scroll independently.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  title: {
    default: "Admin",
    template: "%s | Comfort Admin",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-theme flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}

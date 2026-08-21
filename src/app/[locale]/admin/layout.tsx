/**
 * Admin shell fills the viewport. Body scroll is locked by LocaleShell.
 * Only the sidebar nav and main content panes scroll independently.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-light flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}

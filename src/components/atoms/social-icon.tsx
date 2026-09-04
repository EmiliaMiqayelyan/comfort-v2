import type { ReactNode } from "react";

type SocialNetwork = "whatsapp" | "telegram" | "instagram";

function detectSocial(item: { id?: string; label?: string; href?: string }): SocialNetwork | null {
  const haystack = `${item.id ?? ""} ${item.label ?? ""} ${item.href ?? ""}`.toLowerCase();
  if (haystack.includes("whatsapp") || haystack.includes("wa.me")) return "whatsapp";
  if (haystack.includes("telegram") || haystack.includes("t.me")) return "telegram";
  if (haystack.includes("instagram")) return "instagram";
  return null;
}

function IconShell({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="currentColor"
    >
      {children}
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <IconShell>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.02Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.55-3.7 8.24-8.23 8.24Zm4.52-6.16c-.25-.13-1.47-.73-1.7-.81-.22-.09-.39-.13-.55.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.24-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.12.25-.3.37-.44.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.48c-.17 0-.43.06-.66.31s-.87.85-.87 2.07.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.24 3.74 1.49.64 1.9.7 2.58.59.39-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.29Z" />
    </IconShell>
  );
}

function TelegramIcon() {
  return (
    <IconShell>
      <path d="M21.2 3.4 2.8 10.5c-1.26.5-1.25 1.2-.22 1.52l4.77 1.49 11.05-6.97c.52-.32.99-.14.6.2l-8.94 8.07.35 4.91c.5 0 .72-.21.99-.46l2.34-2.27 4.83 3.57c.89.49 1.53.24 1.75-.82L22.5 4.72c.26-1.12-.49-1.64-1.3-1.32Z" />
    </IconShell>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONS: Record<SocialNetwork, ReactNode> = {
  whatsapp: <WhatsAppIcon />,
  telegram: <TelegramIcon />,
  instagram: <InstagramIcon />,
};

export function SocialIcon({
  id,
  label,
  href,
}: {
  id?: string;
  label?: string;
  href?: string;
}) {
  const network = detectSocial({ id, label, href });
  if (!network) return null;
  return ICONS[network];
}

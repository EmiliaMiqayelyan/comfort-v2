import { useId, type ReactNode } from "react";
import type { AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

function ArmeniaFlag() {
  return (
    <>
      <rect width="60" height="10" fill="#D90012" />
      <rect y="10" width="60" height="10" fill="#0033A0" />
      <rect y="20" width="60" height="10" fill="#F2A800" />
    </>
  );
}

function RussiaFlag() {
  return (
    <>
      <rect width="60" height="10" fill="#FFFFFF" />
      <rect y="10" width="60" height="10" fill="#0039A6" />
      <rect y="20" width="60" height="10" fill="#D52B1E" />
    </>
  );
}

function UkFlag() {
  const clipId = useId();
  return (
    <>
      <clipPath id={clipId}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath={`url(#${clipId})`}
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </>
  );
}

const FLAGS: Record<AppLocale, () => ReactNode> = {
  am: ArmeniaFlag,
  ru: RussiaFlag,
  en: UkFlag,
};

export function FlagIcon({ locale, className }: { locale: AppLocale; className?: string }) {
  const Flag = FLAGS[locale];
  return (
    <svg
      viewBox="0 0 60 30"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      className={cn(
        "h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10",
        className,
      )}
    >
      <Flag />
    </svg>
  );
}

"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeLabels, localeNames, type AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type LocaleSelectProps = {
  className?: string;
  inverted?: boolean;
  onChange?: () => void;
};

export function LocaleSelect({ className, inverted, onChange }: LocaleSelectProps) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Select.Root
      value={locale}
      onValueChange={(value) => {
        router.replace(pathname, { locale: value as AppLocale });
        onChange?.();
      }}
    >
      <Select.Trigger
        aria-label="Language"
        className={cn(
          "inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-sm font-medium outline-none transition",
          inverted
            ? "text-white/90 hover:bg-white/10 data-[state=open]:bg-white/10"
            : "text-foreground/90 hover:bg-muted data-[state=open]:bg-muted",
          className,
        )}
      >
        <Select.Value>{localeNames[locale]}</Select.Value>
        <Select.Icon>
          <ChevronDown
            className={cn("h-3.5 w-3.5", inverted ? "text-white/70" : "text-muted-foreground")}
          />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="z-[100] min-w-[9rem] overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          position="popper"
          sideOffset={6}
          align="end"
        >
          <Select.Viewport className="p-1">
            {locales.map((l) => (
              <Select.Item
                key={l}
                value={l}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm",
                  "text-foreground outline-none data-[highlighted]:bg-accent/10 data-[highlighted]:text-accent",
                )}
              >
                <Select.ItemIndicator className="absolute left-2 flex items-center">
                  <Check className="h-4 w-4 text-accent" />
                </Select.ItemIndicator>
                <Select.ItemText>{localeLabels[l]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

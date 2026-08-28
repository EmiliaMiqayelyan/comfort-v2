"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  triggerClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
  triggerClassName?: string;
}) {
  return (
    <Select.Root value={value || undefined} onValueChange={onValueChange}>
      <Select.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-[5px] border border-border",
          "bg-card/90 px-3 text-sm text-foreground outline-none transition",
          "focus-visible:ring-2 focus-visible:ring-accent/30",
          "data-[placeholder]:text-muted-foreground",
          triggerClassName,
          className,
        )}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className={cn(
            "z-[200] overflow-hidden rounded-[5px] border border-border bg-card shadow-lg",
            "w-[var(--radix-select-trigger-width)] min-w-[10rem]",
          )}
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport className="max-h-64 p-1">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-[5px] py-2 pl-8 pr-3 text-sm",
                  "text-foreground outline-none data-[highlighted]:bg-accent/10 data-[highlighted]:text-accent",
                )}
              >
                <Select.ItemIndicator className="absolute left-2 flex items-center">
                  <Check className="h-4 w-4 text-accent" />
                </Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

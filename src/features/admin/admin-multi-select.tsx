"use client";

import { Check, ChevronDown } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export function AdminMultiSelect({
  values,
  onChange,
  placeholder,
  options,
  className,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const selectedLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border",
          "bg-card px-4 py-2 text-sm text-foreground outline-none transition",
          "focus-visible:ring-2 focus-visible:ring-accent/30",
          className,
        )}
      >
        <span className={cn(!selectedLabels.length && "text-muted-foreground")}>
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[100] w-[var(--radix-popover-trigger-width)] min-w-[12rem] rounded-xl border border-border bg-card p-1 shadow-2xl"
          sideOffset={6}
          align="start"
        >
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const selected = values.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2.5 pl-8 pr-3 text-left text-sm",
                    "text-foreground outline-none hover:bg-accent/10",
                  )}
                >
                  <span className="absolute left-2 flex items-center">
                    {selected ? <Check className="h-4 w-4 text-accent" /> : null}
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  iconClassName,
  inverted,
}: {
  className?: string;
  iconClassName?: string;
  inverted?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(inverted && "text-white hover:bg-white/10", className)}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted && isDark ? (
        <Sun className={cn("h-4 w-4", iconClassName)} />
      ) : (
        <Moon className={cn("h-4 w-4", iconClassName)} />
      )}
    </Button>
  );
}

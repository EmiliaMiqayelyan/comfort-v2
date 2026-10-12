"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  children: ReactNode;
  className?: string;
  moreLabel: string;
  lessLabel: string;
  /** Visible lines while collapsed. */
  lines?: number;
};

/** Paragraph clamped to `lines` with a fade, expanding smoothly; the toggle only shows when the text overflows. */
export function ExpandableText({
  children,
  className,
  moreLabel,
  lessLabel,
  lines = 4,
}: ExpandableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const [fullHeight, setFullHeight] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      setFullHeight(el.scrollHeight);
      if (!expanded) setOverflows(el.scrollHeight > el.clientHeight + 1);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, children]);

  const collapsed = !expanded && overflows;

  return (
    <div>
      <p
        ref={ref}
        id={id}
        className={cn(
          "overflow-hidden transition-[max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed && "[mask-image:linear-gradient(to_bottom,#000_45%,transparent)]",
          className,
        )}
        style={{
          maxHeight: expanded && fullHeight ? `${fullHeight}px` : `${lines}lh`,
        }}
      >
        {children}
      </p>
      {overflows ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.08em] text-foreground transition hover:border-foreground/40 hover:bg-muted/40"
        >
          {expanded ? lessLabel : moreLabel}
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-300",
              expanded && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}

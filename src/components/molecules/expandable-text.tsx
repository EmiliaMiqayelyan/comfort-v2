"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ExpandableTextProps = {
  children: ReactNode;
  className?: string;
  moreLabel: string;
  lessLabel: string;
};

/** Paragraph clamped to 3 lines below `md`, with a toggle shown only when the text overflows. */
export function ExpandableText({
  children,
  className,
  moreLabel,
  lessLabel,
}: ExpandableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      setOverflows(el.scrollHeight > el.clientHeight + 1);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, children]);

  return (
    <div>
      <p
        ref={ref}
        id={id}
        className={cn(className, !expanded && "max-md:line-clamp-3")}
      >
        {children}
      </p>
      {overflows ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-sm font-medium text-foreground underline-offset-4 hover:underline md:hidden"
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </div>
  );
}

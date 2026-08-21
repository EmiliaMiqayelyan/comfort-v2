"use client";

import { Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/atoms/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  createLabel?: string;
  createHref?: string;
  onCreate?: () => void;
}

export function PageHeader({
  title,
  description,
  createLabel,
  createHref,
  onCreate,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {createLabel && createHref && (
        <Button asChild className="rounded-xl bg-[#203E4B] text-white hover:bg-[#203E4B]/90">
          <Link href={createHref}>
            <Plus className="h-4 w-4" />
            {createLabel}
          </Link>
        </Button>
      )}
      {createLabel && !createHref && onCreate && (
        <Button
          onClick={onCreate}
          className="rounded-xl bg-[#203E4B] text-white hover:bg-[#203E4B]/90"
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </Button>
      )}
    </div>
  );
}

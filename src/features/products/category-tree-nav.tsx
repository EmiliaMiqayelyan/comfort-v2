"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getLocalized } from "@/data/catalog";
import {
  childCategories,
  isDescendantOf,
  parentCategories,
} from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

function NavLink({
  category,
  isActive,
  depth = 0,
}: {
  category: ProductCategory;
  isActive: boolean;
  depth?: number;
}) {
  const locale = useLocale();

  return (
    <Link
      href={`/products/${category.slug}`}
      className={cn(
        "relative block border-b border-border/60 py-3.5 text-sm transition hover:text-foreground",
        depth > 0 ? "pl-8 pr-4" : "px-4",
        isActive
          ? "font-semibold text-foreground"
          : "font-normal text-foreground/70",
      )}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent"
        />
      )}
      {getLocalized(category.name, locale)}
    </Link>
  );
}

function CategoryBranch({
  category,
  categories,
  activeCategoryId,
  defaultOpen = false,
}: {
  category: ProductCategory;
  categories: ProductCategory[];
  activeCategoryId: string;
  defaultOpen?: boolean;
}) {
  const locale = useLocale();
  const children = childCategories(categories, category.id);
  const hasChildren = children.length > 0;
  const isActive = category.id === activeCategoryId;
  const isOnPath =
    Boolean(activeCategoryId) &&
    (isActive || isDescendantOf(activeCategoryId, category.id, categories));
  const [open, setOpen] = useState(defaultOpen || isOnPath);

  if (!hasChildren) {
    return <NavLink category={category} isActive={isActive} />;
  }

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <div className="relative flex items-stretch">
        {isActive && (
          <span
            aria-hidden
            className="absolute inset-y-2 left-0 z-10 w-[3px] rounded-full bg-accent"
          />
        )}
        <Link
          href={`/products/${category.slug}`}
          className={cn(
            "flex-1 py-3.5 pl-4 pr-2 text-sm transition hover:text-foreground",
            isActive || isOnPath
              ? "font-semibold text-foreground"
              : "font-normal text-foreground/70",
          )}
        >
          {getLocalized(category.name, locale)}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Collapse" : "Expand"}
          onClick={() => setOpen((value) => !value)}
          className="shrink-0 px-3 text-foreground/60 transition hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>
      </div>
      {open && (
        <div className="border-t border-border/40 bg-muted/10">
          {children.map((child) => {
            const nested = childCategories(categories, child.id);
            if (nested.length === 0) {
              return (
                <NavLink
                  key={child.id}
                  category={child}
                  isActive={child.id === activeCategoryId}
                  depth={1}
                />
              );
            }
            return (
              <CategoryBranch
                key={child.id}
                category={child}
                categories={categories}
                activeCategoryId={activeCategoryId}
                defaultOpen={defaultOpen}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CategoryTreeNav({
  categories,
  activeCategoryId,
  expandAll = false,
}: {
  categories: ProductCategory[];
  activeCategoryId?: string | null;
  /** Expand all parent categories (useful on the products index). */
  expandAll?: boolean;
}) {
  const t = useTranslations("categories");
  const roots = parentCategories(categories);
  const [collapsed, setCollapsed] = useState(false);
  const activeId = activeCategoryId ?? "";

  if (roots.length === 0) return null;

  return (
    <nav
      aria-label={t.has("catalog") ? t("catalog") : "Catalog"}
      className="overflow-hidden rounded-[5px] border border-border bg-white lg:sticky lg:top-28"
    >
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="flex w-full items-center justify-between border-b border-border/60 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
          {t.has("catalog") ? t("catalog") : "Catalog"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground/60 transition-transform",
            !collapsed && "rotate-180",
          )}
        />
      </button>

      {!collapsed && (
        <div>
          {roots.map((root) => (
            <CategoryBranch
              key={root.id}
              category={root}
              categories={categories}
              activeCategoryId={activeId}
              defaultOpen={expandAll}
            />
          ))}
        </div>
      )}
    </nav>
  );
}

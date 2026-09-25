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

type CategoryTreeNavProps = {
  categories: ProductCategory[];
  activeCategoryId?: string | null;
  /** Expand every parent category (deep). Prefer `defaultExpandFirst` for filter sidebars. */
  expandAll?: boolean;
  /** Expand only the first top-level category on load. Nested branches stay collapsed. */
  defaultExpandFirst?: boolean;
  /**
   * When set, categories act as filters (buttons) instead of product-page links.
   * Pass `null` to clear the selection (e.g. from the catalog header).
   */
  onSelect?: (categoryId: string | null) => void;
};

function CategoryLabel({
  category,
  isActive,
  depth = 0,
  onSelect,
}: {
  category: ProductCategory;
  isActive: boolean;
  depth?: number;
  onSelect?: (categoryId: string | null) => void;
}) {
  const locale = useLocale();
  const className = cn(
    "relative block border-b border-border/60 py-3.5 text-sm uppercase tracking-[0.06em] transition hover:text-foreground",
    depth > 0 ? "pl-8 pr-4" : "px-4",
    isActive
      ? "font-semibold text-foreground"
      : "font-normal text-foreground/70",
  );

  const indicator = isActive ? (
    <span
      aria-hidden
      className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-accent"
    />
  ) : null;

  const label = getLocalized(category.name, locale);

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(isActive ? null : category.id)}
        aria-pressed={isActive}
        className={cn(className, "w-full text-left")}
      >
        {indicator}
        {label}
      </button>
    );
  }

  return (
    <Link href={`/products/${category.slug}`} className={className}>
      {indicator}
      {label}
    </Link>
  );
}

function CategoryBranch({
  category,
  categories,
  activeCategoryId,
  defaultOpen = false,
  expandAll = false,
  onSelect,
}: {
  category: ProductCategory;
  categories: ProductCategory[];
  activeCategoryId: string;
  defaultOpen?: boolean;
  expandAll?: boolean;
  onSelect?: (categoryId: string | null) => void;
}) {
  const locale = useLocale();
  const children = childCategories(categories, category.id);
  const hasChildren = children.length > 0;
  const isActive = category.id === activeCategoryId;
  const isOnPath =
    Boolean(activeCategoryId) &&
    (isActive || isDescendantOf(activeCategoryId, category.id, categories));
  const [open, setOpen] = useState(defaultOpen || expandAll || isOnPath);

  if (!hasChildren) {
    return (
      <CategoryLabel
        category={category}
        isActive={isActive}
        onSelect={onSelect}
      />
    );
  }

  const titleClass = cn(
    "flex-1 py-3.5 pl-4 pr-2 text-sm uppercase tracking-[0.06em] transition hover:text-foreground",
    isActive || isOnPath
      ? "font-semibold text-foreground"
      : "font-normal text-foreground/70",
    onSelect && "text-left",
  );

  const selectCategory = () => {
    onSelect?.(isActive ? null : category.id);
    if (!isActive) setOpen(true);
  };

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <div className="relative flex items-stretch">
        {isActive && (
          <span
            aria-hidden
            className="absolute inset-y-2 left-0 z-10 w-[3px] rounded-full bg-accent"
          />
        )}
        {onSelect ? (
          <button
            type="button"
            onClick={selectCategory}
            aria-pressed={isActive}
            className={titleClass}
          >
            {getLocalized(category.name, locale)}
          </button>
        ) : (
          <Link href={`/products/${category.slug}`} className={titleClass}>
            {getLocalized(category.name, locale)}
          </Link>
        )}
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
                <CategoryLabel
                  key={child.id}
                  category={child}
                  isActive={child.id === activeCategoryId}
                  depth={1}
                  onSelect={onSelect}
                />
              );
            }
            return (
              <CategoryBranch
                key={child.id}
                category={child}
                categories={categories}
                activeCategoryId={activeCategoryId}
                expandAll={expandAll}
                onSelect={onSelect}
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
  defaultExpandFirst = false,
  onSelect,
}: CategoryTreeNavProps) {
  const t = useTranslations("categories");
  const roots = parentCategories(categories);
  const [collapsed, setCollapsed] = useState(false);
  const activeId = activeCategoryId ?? "";
  const catalogLabel = t.has("catalog") ? t("catalog") : "Catalog";

  if (roots.length === 0) return null;

  return (
    <nav
      aria-label={catalogLabel}
      className="catalog-panel overflow-hidden rounded-[5px] border border-border"
    >
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="flex w-full items-center justify-between border-b border-border/60 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
          {catalogLabel}
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
          {roots.map((root, index) => (
            <CategoryBranch
              key={root.id}
              category={root}
              categories={categories}
              activeCategoryId={activeId}
              defaultOpen={
                expandAll || (defaultExpandFirst && index === 0)
              }
              expandAll={expandAll}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </nav>
  );
}

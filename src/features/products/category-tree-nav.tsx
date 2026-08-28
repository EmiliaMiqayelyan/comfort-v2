"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/routing";
import { getLocalized } from "@/data/catalog";
import { childCategories } from "@/lib/category-tree";
import { cn } from "@/lib/utils";
import type { ProductCategory } from "@/types";

function CategoryTreeNode({
  category,
  categories,
  activeCategoryId,
  depth = 0,
}: {
  category: ProductCategory;
  categories: ProductCategory[];
  activeCategoryId: string;
  depth?: number;
}) {
  const locale = useLocale();
  const children = childCategories(categories, category.id);
  const hasChildren = children.length > 0;
  const isActive = category.id === activeCategoryId;
  const isOnPath =
    isActive ||
    children.some((child) => isDescendantActive(child.id, categories, activeCategoryId));
  const [open, setOpen] = useState(isOnPath);

  if (!hasChildren) {
    return (
      <Link
        href={`/products/${category.slug}`}
        className={cn(
          "block py-2 text-sm transition hover:text-foreground",
          depth > 0 && "pl-1",
          isActive ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {getLocalized(category.name, locale)}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-border/70 py-3">
        <Link
          href={`/products/${category.slug}`}
          className={cn(
            "flex-1 text-sm font-semibold uppercase tracking-wide transition hover:text-[#8B1A1A]",
            isActive || isOnPath ? "text-[#8B1A1A]" : "text-foreground",
          )}
        >
          {getLocalized(category.name, locale)}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="rounded-full p-1 text-[#8B1A1A] transition hover:bg-muted"
        >
          <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
        </button>
      </div>
      {open && (
        <div className="space-y-1 py-3 pl-1">
          {children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              categories={categories}
              activeCategoryId={activeCategoryId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function isDescendantActive(
  categoryId: string,
  categories: ProductCategory[],
  activeCategoryId: string,
): boolean {
  if (categoryId === activeCategoryId) return true;
  return childCategories(categories, categoryId).some((child) =>
    isDescendantActive(child.id, categories, activeCategoryId),
  );
}

export function CategoryTreeNav({
  rootCategory,
  categories,
  activeCategoryId,
}: {
  rootCategory: ProductCategory;
  categories: ProductCategory[];
  activeCategoryId: string;
}) {
  const children = childCategories(categories, rootCategory.id);
  if (children.length === 0) return null;

  return (
    <nav className="lg:sticky lg:top-28">
      {children.map((child) => (
        <CategoryTreeNode
          key={child.id}
          category={child}
          categories={categories}
          activeCategoryId={activeCategoryId}
        />
      ))}
    </nav>
  );
}

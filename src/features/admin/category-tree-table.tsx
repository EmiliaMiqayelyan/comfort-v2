"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, CornerDownRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import {
  categoriesInTreeOrder,
  categoryAncestors,
  childCategories,
} from "@/lib/category-tree";
import type { ProductCategory } from "@/types";

type CategoryTreeTableProps = {
  items: ProductCategory[];
  localeName: (category: ProductCategory) => string;
  rootLabel: string;
  subLabel: string;
  childOfLabel: (parent: string) => string;
  createSubLabel: string;
  editLabel: string;
  deleteLabel: string;
  emptyLabel: string;
  expandAllLabel: string;
  collapseAllLabel: string;
  hiddenChildrenLabel: (count: number) => string;
  slugHeader?: string;
  productsHeader: string;
  structureHeader: string;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  onCreateSub: (category: ProductCategory) => void;
};

function descendantCount(categoryId: string, items: ProductCategory[]): number {
  const children = childCategories(items, categoryId);
  return children.reduce(
    (total, child) => total + 1 + descendantCount(child.id, items),
    0,
  );
}

function parentIdsWithChildren(items: ProductCategory[]) {
  return new Set(
    items
      .filter((category) => childCategories(items, category.id).length > 0)
      .map((category) => category.id),
  );
}

export function CategoryTreeTable({
  items,
  localeName,
  rootLabel,
  subLabel,
  childOfLabel,
  createSubLabel,
  editLabel,
  deleteLabel,
  emptyLabel,
  expandAllLabel,
  collapseAllLabel,
  hiddenChildrenLabel,
  slugHeader = "Slug",
  productsHeader,
  structureHeader,
  onEdit,
  onDelete,
  onCreateSub,
}: CategoryTreeTableProps) {
  const rows = categoriesInTreeOrder(items);
  const parentsWithChildren = useMemo(() => parentIdsWithChildren(items), [items]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 || initializedRef.current) return;
    initializedRef.current = true;
    setCollapsed(parentIdsWithChildren(items));
  }, [items]);

  const collapsedSet = collapsed;

  const visibleRows = rows.filter(({ category }) => {
    const ancestors = categoryAncestors(category.id, items);
    return !ancestors.some((ancestor) => collapsedSet.has(ancestor.id));
  });

  const toggleCollapsed = (categoryId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const expandAll = () => setCollapsed(new Set());
  const collapseAll = () => setCollapsed(new Set(parentsWithChildren));

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground shadow-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-[5px]"
          onClick={expandAll}
        >
          {expandAllLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-[5px]"
          onClick={collapseAll}
        >
          {collapseAllLabel}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-[#203E4B] text-white">
                <th className="px-5 py-3.5 font-medium">{structureHeader}</th>
                <th className="px-5 py-3.5 font-medium">{slugHeader}</th>
                <th className="px-5 py-3.5 font-medium">{productsHeader}</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map(({ category, depth }) => {
                const name = localeName(category);
                const parent = category.parentId
                  ? items.find((item) => item.id === category.parentId)
                  : undefined;
                const parentName = parent ? localeName(parent) : null;
                const hasChildren = parentsWithChildren.has(category.id);
                const isCollapsed = collapsedSet.has(category.id);
                const hiddenCount = isCollapsed ? descendantCount(category.id, items) : 0;

                return (
                  <tr
                    key={category.id}
                    className={cn(
                      "border-b border-border last:border-0 transition-colors hover:bg-accent/5",
                      depth > 0 && "bg-muted/20",
                    )}
                  >
                    <td className="px-5 py-4">
                      <div
                        className="flex items-start gap-2"
                        style={{ paddingLeft: `${depth * 1.75}rem` }}
                      >
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => toggleCollapsed(category.id)}
                            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] text-secondary transition hover:bg-secondary/10 dark:text-accent dark:hover:bg-accent/10"
                            aria-expanded={!isCollapsed}
                            aria-label={isCollapsed ? expandAllLabel : collapseAllLabel}
                          >
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        ) : depth > 0 ? (
                          <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <span className="mt-0.5 inline-block h-5 w-5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "text-foreground",
                                depth === 0 ? "font-semibold" : "font-medium",
                              )}
                            >
                              {name}
                            </span>
                            <Badge
                              className={cn(
                                "border-0 text-[10px] uppercase tracking-wide",
                                depth === 0
                                  ? "bg-secondary/15 text-secondary dark:bg-accent/15 dark:text-accent"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {depth === 0 ? rootLabel : subLabel}
                            </Badge>
                            {hiddenCount > 0 && (
                              <Badge className="border-0 bg-amber-500/12 text-[10px] text-amber-800 dark:text-amber-300">
                                {hiddenChildrenLabel(hiddenCount)}
                              </Badge>
                            )}
                          </div>
                          {parentName && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {childOfLabel(parentName)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{category.slug}</td>
                    <td className="px-5 py-4">{category.productCount ?? 0}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCreateSub(category)}
                          className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {createSubLabel}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(category)}
                          className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {editLabel}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(category)}
                          className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deleteLabel}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

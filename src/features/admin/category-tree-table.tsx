"use client";

import { CornerDownRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import { categoriesInTreeOrder } from "@/lib/category-tree";
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
  slugHeader?: string;
  productsHeader: string;
  structureHeader: string;
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
  onCreateSub: (category: ProductCategory) => void;
};

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
  slugHeader = "Slug",
  productsHeader,
  structureHeader,
  onEdit,
  onDelete,
  onCreateSub,
}: CategoryTreeTableProps) {
  const rows = categoriesInTreeOrder(items);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center text-sm text-muted-foreground shadow-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
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
            {rows.map(({ category, depth }) => {
              const name = localeName(category);
              const parent = category.parentId
                ? items.find((item) => item.id === category.parentId)
                : undefined;
              const parentName = parent ? localeName(parent) : null;

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
                      {depth > 0 ? (
                        <CornerDownRight className="mt-0.5 h-4 w-4 shrink-0 text-[#203E4B]/70" />
                      ) : (
                        <span className="mt-0.5 inline-block h-4 w-4 shrink-0" />
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
                                ? "bg-[#203E4B]/12 text-[#203E4B]"
                                : "bg-slate-500/12 text-slate-700",
                            )}
                          >
                            {depth === 0 ? rootLabel : subLabel}
                          </Badge>
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
                        className="rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
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
  );
}

"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import { DataTable } from "@/features/admin/data-table";
import { useAdminDelete } from "@/features/admin/confirm-dialog";
import { useRouter } from "@/i18n/routing";
import { adminApi, catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import type { ProductCategory } from "@/types";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<ProductCategory[]>([]);
  const { deleteWithConfirm, dialog, error } = useAdminDelete();

  const load = useCallback(async () => {
    setItems((await catalogApi.categories()) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader
          title={t("categories")}
          createLabel={t("create")}
          createHref="/admin/categories/new"
        />
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <DataTable
          data={items}
          editLabel={t("edit")}
          deleteLabel={t("delete")}
          emptyLabel={t("noResults")}
          onEdit={(row) => router.push(`/admin/categories/${row.id}`)}
          onDelete={async (row) => {
            const ok = await deleteWithConfirm(() => adminApi.deleteCategory(row.id));
            if (ok) setItems((prev) => prev.filter((item) => item.id !== row.id));
          }}
          columns={[
            { key: "name", header: t("name"), render: (row) => getLocalized(row.name, locale) },
            {
              key: "parentId",
              header: t("parentCategory"),
              render: (row) => {
                if (!row.parentId) return t("topLevelCategory");
                const parent = items.find((item) => item.id === row.parentId);
                return parent ? getLocalized(parent.name, locale) : "—";
              },
            },
            { key: "slug", header: "Slug" },
            { key: "productCount", header: t("products") },
          ]}
        />
        {dialog}
      </AdminShell>
    </AuthGate>
  );
}

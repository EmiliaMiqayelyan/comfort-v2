"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import { DataTable, StatusBadge } from "@/features/admin/data-table";
import { useRouter } from "@/i18n/routing";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminDelete } from "@/features/admin/confirm-dialog";
import { adminApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import type { Product, ProductCategory } from "@/types";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { deleteWithConfirm, dialog, error: deleteError } = useAdminDelete();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [products, nextCategories] = await Promise.all([
        adminApi.products(),
        adminApi.categories(),
      ]);
      setItems(products);
      setCategories(nextCategories);
    } catch {
      setError(t("apiUnavailable"));
      setItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryName = (id: string) => {
    const category = categories.find((item) => item.id === id);
    return category ? getLocalized(category.name, locale) : id;
  };

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader
          title={t("products")}
          createLabel={t("create")}
          createHref="/admin/products/new"
        />
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-sm text-red-600">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {deleteError && (
              <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {deleteError}
              </div>
            )}
            <DataTable
              data={items}
              editLabel={t("edit")}
              deleteLabel={t("delete")}
              emptyLabel={t("noResults")}
              onEdit={(row) => router.push(`/admin/products/${row.id}`)}
              onDelete={async (row) => {
                const ok = await deleteWithConfirm(() => adminApi.deleteProduct(row.id));
                if (ok) {
                  setItems((prev) => prev.filter((item) => item.id !== row.id));
                  await queryClient.invalidateQueries({ queryKey: ["products"] });
                }
              }}
              columns={[
                {
                  key: "name",
                  header: t("name"),
                  render: (row) => getLocalized(row.name, locale),
                },
                { key: "sku", header: "SKU" },
                {
                  key: "categoryId",
                  header: t("categories"),
                  render: (row) => categoryName(row.categoryId),
                },
                {
                  key: "availability",
                  header: t("status"),
                  render: (row) => (
                    <StatusBadge status={row.featured ? "published" : row.availability} />
                  ),
                },
                {
                  key: "price",
                  header: t("price"),
                  render: (row) => String(row.price),
                },
              ]}
            />
            {dialog}
          </>
        )}
      </AdminShell>
    </AuthGate>
  );
}

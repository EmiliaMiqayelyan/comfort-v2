"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import { DataTable, StatusBadge } from "@/features/admin/data-table";
import { useAdminDelete } from "@/features/admin/confirm-dialog";
import { useRouter } from "@/i18n/routing";
import { adminApi, catalogApi } from "@/lib/api";
import { getLocalized } from "@/data/catalog";
import type { DownloadFile } from "@/types";

export default function AdminDownloadsPage() {
  const t = useTranslations("admin");
  const td = useTranslations("downloads");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<DownloadFile[]>([]);
  const { deleteWithConfirm, dialog, error } = useAdminDelete();

  const load = useCallback(async () => {
    setItems((await catalogApi.downloads()) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader
          title={t("downloads")}
          createLabel={t("create")}
          createHref="/admin/downloads/new"
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
          onEdit={(row) => router.push(`/admin/downloads/${row.id}`)}
          onDelete={async (row) => {
            const ok = await deleteWithConfirm(() => adminApi.deleteDownload(row.id));
            if (ok) setItems((prev) => prev.filter((item) => item.id !== row.id));
          }}
          columns={[
            { key: "filename", header: t("filename") },
            { key: "title", header: t("name"), render: (row) => getLocalized(row.title, locale) },
            { key: "category", header: td("categories"), render: (row) => td(row.category) },
            {
              key: "downloadable",
              header: t("downloadable"),
              render: (row) => <StatusBadge status={row.downloadable ? "published" : "draft"} />,
            },
          ]}
        />
        {dialog}
      </AdminShell>
    </AuthGate>
  );
}

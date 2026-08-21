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
import type { Certificate } from "@/types";

export default function AdminCertificatesPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<Certificate[]>([]);
  const { deleteWithConfirm, dialog, error } = useAdminDelete();

  const load = useCallback(async () => {
    setItems((await catalogApi.certificates()) ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader
          title={t("certificates")}
          createLabel={t("create")}
          createHref="/admin/certificates/new"
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
          onEdit={(row) => router.push(`/admin/certificates/${row.id}`)}
          onDelete={async (row) => {
            const ok = await deleteWithConfirm(() => adminApi.deleteCertificate(row.id));
            if (ok) setItems((prev) => prev.filter((item) => item.id !== row.id));
          }}
          columns={[
            { key: "title", header: t("name"), render: (row) => getLocalized(row.title, locale) },
            { key: "issuer", header: t("issuer") },
            { key: "year", header: t("year") },
          ]}
        />
        {dialog}
      </AdminShell>
    </AuthGate>
  );
}

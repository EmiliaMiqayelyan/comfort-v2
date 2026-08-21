"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PageHeader } from "@/features/admin/page-header";
import { DataTable, StatusBadge } from "@/features/admin/data-table";

type Row = { id: string } & Record<string, string>;

export function AdminListPage({
  titleKey,
  description,
  columns,
  initialRows,
  createRow,
}: {
  titleKey: string;
  description?: string;
  columns: { key: string; header: string; status?: boolean }[];
  initialRows: Row[];
  createRow: () => Row;
}) {
  const t = useTranslations("admin");
  const [items, setItems] = useState<Row[]>(initialRows);

  return (
    <AuthGate>
      <AdminShell>
        <PageHeader
          title={t(titleKey)}
          description={description}
          createLabel={t("create")}
          onCreate={() => setItems((prev) => [createRow(), ...prev])}
        />
        <DataTable<Row>
          data={items}
          editLabel={t("edit")}
          emptyLabel={t("noResults")}
          onEdit={() => {}}
          columns={columns.map((col) => ({
            key: col.key,
            header: col.header,
            render: col.status
              ? (row) => <StatusBadge status={row[col.key] ?? "draft"} />
              : undefined,
          }))}
        />
      </AdminShell>
    </AuthGate>
  );
}

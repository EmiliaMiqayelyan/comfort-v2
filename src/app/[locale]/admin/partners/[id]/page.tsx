"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { PartnerForm } from "@/features/admin/partner-form";
import { catalogApi } from "@/lib/api";
import type { Partner } from "@/types";

export default function AdminEditPartnerPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("common");
  const [item, setItem] = useState<Partner | null | undefined>(undefined);

  useEffect(() => {
    if (!params.id) return;
    catalogApi.partner(params.id).then(setItem);
  }, [params.id]);

  if (!item) {
    return (
      <AuthGate>
        <AdminShell>
          <p className="text-sm text-muted-foreground">
            {item === undefined ? t("loading") : t("error")}
          </p>
        </AdminShell>
      </AuthGate>
    );
  }

  return <PartnerForm partner={item} />;
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { ProjectForm } from "@/features/admin/project-form";
import { catalogApi } from "@/lib/api";
import type { Project } from "@/types";

export default function AdminEditProjectPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("common");
  const [item, setItem] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    if (!params.id) return;
    catalogApi.project(params.id).then(setItem);
  }, [params.id]);

  if (!item) {
    return (
      <AuthGate>
        <AdminShell>
          <p className="text-sm text-muted-foreground">{item === undefined ? t("loading") : t("error")}</p>
        </AdminShell>
      </AuthGate>
    );
  }

  return <ProjectForm project={item} />;
}

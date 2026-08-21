"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { ProductForm } from "@/features/admin/product-form";
import { adminApi } from "@/lib/api";
import type { Product } from "@/types";

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("common");
  const ta = useTranslations("admin");
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    adminApi
      .product(params.id)
      .then((item) => {
        setProduct(item);
        setError(null);
      })
      .catch((err) => {
        setProduct(null);
        setError(t("error"));
      });
  }, [params.id, t]);

  if (product === undefined) {
    return (
      <AuthGate>
        <AdminShell>
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        </AdminShell>
      </AuthGate>
    );
  }

  if (!product) {
    return (
      <AuthGate>
        <AdminShell>
          <p className="text-sm text-red-300">{error || ta("apiUnavailable")}</p>
        </AdminShell>
      </AuthGate>
    );
  }

  return <ProductForm product={product} />;
}

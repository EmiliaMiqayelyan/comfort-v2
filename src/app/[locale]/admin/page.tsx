"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Package, FolderTree, Layers, Building2, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { AuthGate } from "@/features/admin/auth-gate";
import { AdminShell } from "@/features/admin/admin-shell";
import { catalogApi } from "@/lib/api";

const cards = [
  { href: "/admin/products", labelKey: "products", icon: Package, countKey: "products" as const },
  { href: "/admin/categories", labelKey: "categories", icon: FolderTree, countKey: "categories" as const },
  { href: "/admin/collections", labelKey: "collections", icon: Layers, countKey: "collections" as const },
  { href: "/admin/projects", labelKey: "projects", icon: Building2, countKey: "projects" as const },
];

export default function AdminDashboardPage() {
  const t = useTranslations("admin");
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    collections: 0,
    projects: 0,
  });

  useEffect(() => {
    Promise.all([
      catalogApi.products(),
      catalogApi.categories(),
      catalogApi.collections(),
      catalogApi.projects(),
    ]).then(([products, categories, collections, projects]) => {
      setCounts({
        products: products?.length ?? 0,
        categories: categories?.length ?? 0,
        collections: collections?.length ?? 0,
        projects: projects?.length ?? 0,
      });
    });
  }, []);

  return (
    <AuthGate>
      <AdminShell>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("dashboard")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("welcomeBack")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-accent/30 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-accent" />
                </div>
                <p className="mt-5 text-sm text-muted-foreground">{t(card.labelKey)}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {counts[card.countKey]}
                </p>
              </Link>
            );
          })}
        </div>
      </AdminShell>
    </AuthGate>
  );
}

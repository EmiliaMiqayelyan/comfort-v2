"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { BrandLogo } from "@/components/atoms/brand-logo";
import { cn } from "@/lib/utils";
import { getNavForRole } from "./role-nav";
import { RoleBadge } from "./data-table";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const t = useTranslations("admin");
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems = getNavForRole(user.role);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <aside
        className={cn(
          "flex min-h-0 shrink-0 flex-col border-r border-border bg-white transition-all duration-300",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-1 border-b border-border px-3">
          {!collapsed ? (
            <Link href="/" className="min-w-0 px-1">
              <BrandLogo heightClassName="h-10" />
            </Link>
          ) : (
            <span className="display px-1 text-lg text-[#203E4B]">C</span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="admin-pane-scroll min-h-0 flex-1 overscroll-contain px-2 py-4">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                      active
                        ? "bg-[#203E4B] font-medium text-white"
                        : "text-muted-foreground hover:bg-[#203E4B]/10 hover:text-foreground",
                      collapsed && "justify-center px-2",
                    )}
                    title={collapsed ? t(item.labelKey) : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{t(item.labelKey)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl bg-[#203E4B]/10 px-3 py-2.5">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <RoleBadge role={user.role} />
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mb-2 flex justify-center">
              <Badge className="border-0 bg-[#203E4B]/15 px-2 text-[10px] uppercase text-[#203E4B]">
                {user.role.slice(0, 3)}
              </Badge>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed ? "justify-center px-2" : "justify-start",
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && t("logout")}
          </Button>
        </div>
      </aside>

      <main className="admin-pane-scroll min-h-0 flex-1 overscroll-contain bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">{children}</div>
      </main>
    </div>
  );
}

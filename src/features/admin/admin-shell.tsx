"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ChevronLeft, LogOut, Menu } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useAuthStore } from "@/stores";
import { Button } from "@/components/atoms/button";
import { BrandLogo } from "@/components/atoms/brand-logo";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import { cn } from "@/lib/utils";
import { getNavForRole } from "./role-nav";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const t = useTranslations("admin");
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    const syncLayout = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    syncLayout();
    media.addEventListener("change", syncLayout);
    return () => media.removeEventListener("change", syncLayout);
  }, []);

  if (!user) return null;

  const navItems = getNavForRole(user.role);
  const sidebarOpen = !collapsed;
  const logoInverted = themeMounted && resolvedTheme === "dark";

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const closeSidebar = () => setCollapsed(true);
  const openSidebar = () => setCollapsed(false);

  const handleNavClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close sidebar"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          "flex min-h-0 shrink-0 flex-col border-r border-border bg-card transition-all duration-300",
          isMobile
            ? cn(
                "fixed inset-y-0 left-0 z-50 w-64 shadow-xl",
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
              )
            : collapsed
              ? "w-[72px]"
              : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border",
            collapsed && !isMobile ? "justify-center px-2" : "justify-between gap-2 px-3",
          )}
        >
          {collapsed && !isMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={openSidebar}
              className="h-10 w-10 rounded-[5px] bg-muted/50 text-foreground hover:bg-muted"
              aria-label="Expand sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            <>
              <Link href="/" className="min-w-0 px-1" onClick={handleNavClick}>
                <BrandLogo heightClassName="h-10" inverted={logoInverted} />
              </Link>
              <div className="flex items-center gap-1">
                <ThemeToggle className="rounded-lg" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={closeSidebar}
                  className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
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
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                      active
                        ? "bg-[#203E4B] font-medium text-white"
                        : "text-muted-foreground hover:bg-[#203E4B]/10 hover:text-foreground",
                      collapsed && !isMobile && "justify-center px-2",
                    )}
                    title={collapsed && !isMobile ? t(item.labelKey) : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {(!collapsed || isMobile) && <span>{t(item.labelKey)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          {collapsed && !isMobile && (
            <div className="mb-2 flex justify-center">
              <ThemeToggle className="rounded-lg" />
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && !isMobile ? "justify-center px-2" : "justify-start",
            )}
          >
            <LogOut className="h-4 w-4" />
            {(!collapsed || isMobile) && t("logout")}
          </Button>
        </div>
      </aside>

      <main className="admin-pane-scroll min-h-0 min-w-0 flex-1 overscroll-contain bg-background">
        {isMobile && (
          <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={openSidebar}
              className="rounded-[5px] text-foreground hover:bg-muted"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="min-w-0">
              <BrandLogo heightClassName="h-8" inverted={logoInverted} />
            </Link>
            <ThemeToggle className="rounded-lg" />
          </div>
        )}

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

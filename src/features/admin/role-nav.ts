import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Layers,
  Building2,
  Award,
  Download,
  Mail,
} from "lucide-react";
import type { Role } from "@/types";

export interface AdminNavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  roles: Role[];
}

/** Minimal CMS: only sections that save to MySQL via API */
export const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin",
    labelKey: "dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "editor", "translator", "dealer"],
  },
  {
    href: "/admin/products",
    labelKey: "products",
    icon: Package,
    roles: ["admin", "manager", "editor", "translator", "dealer"],
  },
  {
    href: "/admin/categories",
    labelKey: "categories",
    icon: FolderTree,
    roles: ["admin", "manager", "editor"],
  },
  {
    href: "/admin/collections",
    labelKey: "collections",
    icon: Layers,
    roles: ["admin", "manager", "editor"],
  },
  {
    href: "/admin/projects",
    labelKey: "projects",
    icon: Building2,
    roles: ["admin", "manager", "editor"],
  },
  {
    href: "/admin/certificates",
    labelKey: "certificates",
    icon: Award,
    roles: ["admin", "manager", "editor"],
  },
  {
    href: "/admin/downloads",
    labelKey: "downloads",
    icon: Download,
    roles: ["admin", "manager", "editor"],
  },
  {
    href: "/admin/contact",
    labelKey: "contactInbox",
    icon: Mail,
    roles: ["admin", "manager"],
  },
];

export function getNavForRole(role: Role): AdminNavItem[] {
  return adminNavItems.filter((item) => item.roles.includes(role));
}

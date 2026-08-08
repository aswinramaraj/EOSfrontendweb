import type { ComponentType, SVGProps } from "react";
import { DashboardIcon, ShieldPersonIcon } from "@/shared/components/icons";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "Academics",
    items: [{ href: "/admin/advisors", label: "Advisors", icon: ShieldPersonIcon }],
  },
];

const FLAT_NAV = ADMIN_NAV.flatMap((group) => group.items);

export function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  const match = FLAT_NAV.find(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href),
  );
  return match?.label ?? "Admin";
}

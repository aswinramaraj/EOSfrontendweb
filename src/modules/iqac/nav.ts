import type { ComponentType, SVGProps } from "react";
import { BarChartIcon, BuildingIcon, ClockIcon, DashboardIcon } from "@/shared/components/icons";

export interface IqacNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface IqacNavGroup {
  label: string;
  items: IqacNavItem[];
}

export const IQAC_NAV: IqacNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/iqac", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "Modules",
    items: [
      { href: "/iqac/venue-booking", label: "Venue Booking", icon: BuildingIcon },
      { href: "/iqac/od-details", label: "OD Details", icon: ClockIcon },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/iqac/reports", label: "Reports", icon: BarChartIcon }],
  },
];

const FLAT_NAV = IQAC_NAV.flatMap((group) => group.items);

export function getIqacPageTitle(pathname: string): string {
  if (pathname === "/iqac") return "Dashboard";
  const match = FLAT_NAV.find((item) => item.href !== "/iqac" && pathname.startsWith(item.href));
  return match?.label ?? "IQAC";
}

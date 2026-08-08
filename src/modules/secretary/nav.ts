import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  BriefcaseIcon,
  CalendarIcon,
  DashboardIcon,
  ImageIcon,
  MapPinIcon,
} from "@/shared/components/icons";

export interface SecretaryNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface SecretaryNavGroup {
  label: string;
  items: SecretaryNavItem[];
}

export const SECRETARY_NAV: SecretaryNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/secretary", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "Modules",
    items: [
      { href: "/secretary/attendance", label: "Attendance", icon: CalendarIcon },
      { href: "/secretary/proposals", label: "Proposals", icon: BriefcaseIcon },
      { href: "/secretary/venue-booking", label: "Venue Booking", icon: MapPinIcon },
      { href: "/secretary/media-request", label: "Media Request", icon: ImageIcon },
      { href: "/secretary/timetable", label: "Timetable", icon: CalendarIcon },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/secretary/reports", label: "Reports", icon: BarChartIcon }],
  },
];

const FLAT_NAV = SECRETARY_NAV.flatMap((group) => group.items);

export function getSecretaryPageTitle(pathname: string): string {
  if (pathname === "/secretary") return "Dashboard";
  const match = FLAT_NAV.find(
    (item) => item.href !== "/secretary" && pathname.startsWith(item.href),
  );
  return match?.label ?? "Secretary Portal";
}

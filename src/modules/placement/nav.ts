import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  BellIcon,
  BriefcaseIcon,
  CalendarIcon,
  DashboardIcon,
  IdCardIcon,
  MailIcon,
  SwapIcon,
} from "@/shared/components/icons";

export interface PlacementNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const PLACEMENT_NAV: PlacementNavItem[] = [
  { href: "/placement", label: "Dashboard", icon: DashboardIcon },
  { href: "/placement/companies", label: "Companies", icon: BriefcaseIcon },
  { href: "/placement/drives", label: "Placement Drives", icon: CalendarIcon },
  { href: "/placement/rounds", label: "Round Management", icon: SwapIcon },
  { href: "/placement/students", label: "Student Reports", icon: IdCardIcon },
  { href: "/placement/offers", label: "Offers", icon: MailIcon },
  { href: "/placement/reports", label: "Reports", icon: BarChartIcon },
  { href: "/placement/notifications", label: "Notifications", icon: BellIcon },
];

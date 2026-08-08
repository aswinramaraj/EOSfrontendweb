import type { ComponentType, SVGProps } from "react";
import {
  AlertTriangleIcon,
  BarChartIcon,
  BedIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  CogIcon,
  DashboardIcon,
  PeopleIcon,
  SwapIcon,
  WalletIcon,
} from "@/shared/components/icons";

export interface HostelNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface HostelNavGroup {
  label: string;
  items: HostelNavItem[];
}

export const HOSTEL_NAV: HostelNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/hostel", label: "Dashboard", icon: DashboardIcon },
      { href: "/hostel/approvals", label: "Approvals", icon: CheckIcon },
    ],
  },
  {
    label: "Students",
    items: [
      { href: "/hostel/students", label: "Student details", icon: PeopleIcon },
      { href: "/hostel/leave-requests", label: "Leave requests", icon: ClockIcon },
      { href: "/hostel/gate-log", label: "Check-in / check-out", icon: SwapIcon },
    ],
  },
  {
    label: "Hostel",
    items: [
      { href: "/hostel/hostels", label: "Hostel details", icon: BuildingIcon },
      { href: "/hostel/rooms", label: "Rooms & occupancy", icon: BedIcon },
      { href: "/hostel/fees", label: "Hostel fees", icon: WalletIcon },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/hostel/complaints", label: "Complaints & feedback", icon: AlertTriangleIcon },
      { href: "/hostel/reports", label: "Reports", icon: BarChartIcon },
      { href: "/hostel/settings", label: "Settings", icon: CogIcon },
    ],
  },
];

const FLAT_NAV = HOSTEL_NAV.flatMap((group) => group.items);

export function getHostelPageTitle(pathname: string): string {
  if (pathname === "/hostel") return "Dashboard";
  const match = FLAT_NAV.find(
    (item) => item.href !== "/hostel" && pathname.startsWith(item.href),
  );
  return match?.label ?? "Hostel";
}

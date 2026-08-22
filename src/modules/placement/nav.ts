import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  CalendarIcon,
  ChatIcon,
  DashboardIcon,
  FileTextIcon,
  MegaphoneIcon,
  PeopleIcon,
  StarIcon,
} from "@/shared/components/icons";

export interface PlacementNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Real, live count shown as a badge — only set for items with a genuinely available total (see PlacementSidebar). */
  badgeKey?: "students" | "companies" | "drives";
}

export interface PlacementNavGroup {
  label: string;
  items: PlacementNavItem[];
}

export const PLACEMENT_NAV: PlacementNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/placement", label: "Dashboard", icon: DashboardIcon },
      { href: "/placement/announcements", label: "Announcements", icon: MegaphoneIcon },
      { href: "/placement/academic-calendar", label: "Academic calendar", icon: CalendarIcon },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { href: "/placement/students", label: "Students", icon: PeopleIcon, badgeKey: "students" },
      { href: "/placement/companies", label: "Companies", icon: BriefcaseIcon, badgeKey: "companies" },
      { href: "/placement/drives", label: "Placement Drives", icon: CalendarCheckIcon, badgeKey: "drives" },
    ],
  },
  {
    label: "Process",
    items: [
      { href: "/placement/interviews", label: "Interviews", icon: ChatIcon },
      { href: "/placement/offers", label: "Offers", icon: StarIcon },
    ],
  },
  {
    label: "Outcomes",
    items: [
      { href: "/placement/placements", label: "Placements", icon: BarChartIcon },
      { href: "/placement/reports", label: "Reports", icon: FileTextIcon },
    ],
  },
];

/** Flat list — kept for any code that still needs "every nav item" without the group structure (e.g. active-path matching). */
export const PLACEMENT_NAV_FLAT: PlacementNavItem[] = PLACEMENT_NAV.flatMap((g) => g.items);

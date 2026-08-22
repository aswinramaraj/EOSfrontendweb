import type { ComponentType, SVGProps } from "react";
import {
  ActivityIcon,
  BarChartIcon,
  CalendarIcon,
  ChatIcon,
  ClockIcon,
  DashboardIcon,
  FileTextIcon,
  LayersIcon,
  PersonIcon,
  PlusIcon,
  SwapIcon,
  UserCheckIcon,
} from "@/shared/components/icons";

export interface CoordinatorNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Not wired up yet — rendered as a disabled row instead of a link. */
  soon?: boolean;
}

export interface CoordinatorNavGroup {
  label: string;
  items: CoordinatorNavItem[];
}

/**
 * Mirrors the reference UI's exact sidebar inventory — one persistent list
 * covering both "Curriculum Module" and "Academic Modules" pages (the
 * reference splits these across two separate static HTML files that link
 * back and forth to each other; a real SPA just keeps one sidebar with
 * route-based active-highlighting instead of swapping the whole nav).
 */
export const COORDINATOR_NAV: CoordinatorNavGroup[] = [
  {
    label: "OVERVIEW",
    items: [{ href: "/academic-coordinator", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "CURRICULUM",
    items: [
      { href: "/academic-coordinator/create", label: "Create", icon: PlusIcon },
      { href: "/academic-coordinator/map", label: "Map", icon: SwapIcon },
      { href: "/academic-coordinator/feedback", label: "Feedback", icon: ChatIcon },
    ],
  },
  {
    label: "PLANNING",
    items: [{ href: "/academic-coordinator/academic-calendar", label: "Academic Calendar", icon: CalendarIcon }],
  },
  {
    label: "MORE",
    items: [
      { href: "/academic-coordinator/structure", label: "Academic Structure", icon: LayersIcon },
      { href: "/academic-coordinator/faculty", label: "Faculty Management", icon: PersonIcon },
      { href: "/academic-coordinator/workload", label: "Faculty Workload", icon: ClockIcon },
      { href: "/academic-coordinator/timetable", label: "Timetable", icon: ClockIcon },
      { href: "/academic-coordinator/attendance", label: "Attendance", icon: UserCheckIcon },
      { href: "/academic-coordinator/progress", label: "Course Progress", icon: ActivityIcon },
      { href: "/academic-coordinator/results", label: "Results", icon: BarChartIcon },
      { href: "/academic-coordinator/audit", label: "Academic Audit", icon: ActivityIcon },
      { href: "/academic-coordinator/reports", label: "Reports", icon: FileTextIcon },
    ],
  },
];

/** Flat list — kept for any code that needs "every nav item" without the group structure (e.g. active-path matching). */
export const COORDINATOR_NAV_FLAT: CoordinatorNavItem[] = COORDINATOR_NAV.flatMap((g) => g.items);

/** Pages that render the shared "Academic year / Semester / Department / Section" context bar (the "MORE" / Academic Modules pages only — Dashboard/Create/Map/Feedback/Academic Calendar don't have it). */
export const CONTEXT_BAR_PATHS = new Set(COORDINATOR_NAV[3].items.map((i) => i.href));

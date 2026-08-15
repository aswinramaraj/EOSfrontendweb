import type { ComponentType, SVGProps } from "react";
import {
  AwardIcon,
  BarChartIcon,
  CalendarIcon,
  ClipboardIcon,
  ClockIcon,
  DashboardIcon,
  FileTextIcon,
  FolderIcon,
  InboxIcon,
  LayersIcon,
  PeopleIcon,
  RupeeIcon,
} from "@/shared/components/icons";
export interface HRNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  soon?: boolean;
  badge?: number;
  badgeTone?: "red" | "blue";
}

export interface HRNavGroup {
  label: string;
  items: HRNavItem[];
}

// Grouped by section — same convention as LIBRARY_NAV.
export const HR_NAV: HRNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/hr", label: "Dashboard", icon: DashboardIcon },
      { href: "/hr/faculty-directory", label: "Faculty Directory", icon: PeopleIcon },
      { href: "/hr/departments", label: "Departments", icon: FolderIcon },
      { href: "/hr/faculty-documents", label: "Documents", icon: ClipboardIcon },
      {
        href: "/hr/requests",
        label: "Requests",
        icon: InboxIcon,
        badgeTone: "red",
      },
    ],
  },
  {
    label: "Appraisal",
    items: [
      { href: "/hr/criteria-library", label: "Criteria Library", icon: LayersIcon },
      {
        href: "/hr/employee-reviews",
        label: "Employee Reviews",
        icon: AwardIcon,
        badgeTone: "red",
      },
    ],
  },
  {
    label: "Payroll",
    items: [
      { href: "/hr/payroll", label: "Payroll", icon: RupeeIcon, badgeTone: "red" },
      { href: "/hr/payslip-requests", label: "Payslip Requests", icon: FileTextIcon, badgeTone: "red" },
    ],
  },
  {
    label: "Attendance & Leave",
    items: [
      { href: "/hr/faculty-attendance", label: "Faculty Attendance", icon: ClockIcon },
      { href: "/hr/vacation-management", label: "Vacation Management", icon: CalendarIcon },
    ],
  },
  {
    label: "Other",
    items: [
      { href: "/hr/reports", label: "Reports", icon: BarChartIcon },
      { href: "/hr/form-16", label: "Form 16", icon: FileTextIcon },
    ],
  },
];

const FLAT_NAV = HR_NAV.flatMap((group) => group.items);

export function getHRPageTitle(pathname: string): string {
  if (pathname === "/hr") return "Dashboard";
  const match = FLAT_NAV.find((item) => item.href !== "/hr" && pathname.startsWith(item.href));
  return match?.label ?? "HR";
}

import type { ComponentType, SVGProps } from "react";
import {
  AwardIcon,
  BarChartIcon,
  CalendarCheckIcon,
  CalendarIcon,
  ClockIcon,
  DashboardIcon,
  FileTextIcon,
  FolderIcon,
  InboxIcon,
  LayersIcon,
  MegaphoneIcon,
  PeopleIcon,
  RupeeIcon,
  UserPlusIcon,
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

// Grouped to match the reference design's 4 sections (Overview/People/
// Appraisal/Payroll & Compliance) — faculty-documents/form-16 are folded
// into Documents & PF.
export const HR_NAV: HRNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/hr", label: "Dashboard", icon: DashboardIcon },
      { href: "/hr/faculty-attendance", label: "Attendance & Leave", icon: ClockIcon },
      { href: "/hr/vacation-management", label: "Vacation Management", icon: CalendarCheckIcon },
      { href: "/hr/requests", label: "Requests", icon: InboxIcon },
      { href: "/hr/reports", label: "Reports & Analytics", icon: BarChartIcon },
      { href: "/hr/announcements", label: "Announcements", icon: MegaphoneIcon },
      { href: "/hr/academic-calendar", label: "Academic Calendar", icon: CalendarIcon },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/hr/faculty-directory", label: "Faculty Directory", icon: PeopleIcon },
      { href: "/hr/departments", label: "Departments", icon: FolderIcon },
      { href: "/hr/recruitment", label: "Recruitment", icon: UserPlusIcon },
      { href: "/hr/onboarding-exits", label: "Onboarding & Exits", icon: UserPlusIcon },
    ],
  },
  {
    label: "Appraisal",
    items: [
      { href: "/hr/criteria-library", label: "Criteria Library", icon: LayersIcon },
      { href: "/hr/employee-reviews", label: "Employee Reviews", icon: AwardIcon },
    ],
  },
  {
    label: "Payroll & Compliance",
    items: [
      { href: "/hr/payroll", label: "Payroll Run", icon: RupeeIcon },
      { href: "/hr/payslip-requests", label: "Payslip Requests", icon: FileTextIcon },
      { href: "/hr/documents-pf", label: "Documents & PF", icon: FileTextIcon },
    ],
  },
];

const FLAT_NAV = HR_NAV.flatMap((group) => group.items);

export function getHRPageTitle(pathname: string): string {
  if (pathname === "/hr") return "Dashboard";
  const match = FLAT_NAV.find((item) => item.href !== "/hr" && pathname.startsWith(item.href));
  return match?.label ?? "HR";
}

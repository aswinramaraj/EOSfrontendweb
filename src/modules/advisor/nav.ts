import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  DashboardIcon,
  EnvelopeIcon,
  FileTextIcon,
  GraduationCapIcon,
  LayersIcon,
  PeopleIcon,
  PersonIcon,
  ShieldCheckIcon,
  UndoIcon,
} from "@/shared/components/icons";

export interface AdvisorNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface AdvisorNavGroup {
  label: string;
  items: AdvisorNavItem[];
}

export const ADVISOR_NAV: AdvisorNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/advisor", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "Class",
    items: [
      { href: "/advisor/students", label: "My students", icon: PeopleIcon },
      { href: "/advisor/attendance", label: "Attendance", icon: ClockIcon },
      { href: "/advisor/cia-marks", label: "CIA marks", icon: LayersIcon },
      { href: "/advisor/results", label: "Class results", icon: GraduationCapIcon },
      { href: "/advisor/records", label: "Student records", icon: BookIcon },
    ],
  },
  {
    label: "Approvals",
    items: [
      { href: "/advisor/leave", label: "Leave approval", icon: CheckIcon },
      { href: "/advisor/on-duty", label: "On-duty approval", icon: ShieldCheckIcon },
      { href: "/advisor/no-due", label: "No-due requests", icon: UndoIcon },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/advisor/announcements", label: "Announcements", icon: EnvelopeIcon },
      { href: "/advisor/reports", label: "Reports", icon: BarChartIcon },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/advisor/profile", label: "Profile", icon: PersonIcon }],
  },
];

const FLAT_NAV = ADVISOR_NAV.flatMap((group) => group.items);

export function getAdvisorPageTitle(pathname: string): string {
  if (pathname === "/advisor") return "Dashboard";
  const match = FLAT_NAV.find(
    (item) => item.href !== "/advisor" && pathname.startsWith(item.href),
  );
  return match?.label ?? "Advisor";
}

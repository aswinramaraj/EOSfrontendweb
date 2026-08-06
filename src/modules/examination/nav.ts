import type { ComponentType, SVGProps } from "react";
import {
  AlertTriangleIcon,
  AwardIcon,
  BarChartIcon,
  CalendarIcon,
  CogIcon,
  DashboardIcon,
  FileTextIcon,
  GraduationCapIcon,
  GridIcon,
  PencilIcon,
  PeopleIcon,
  RefreshIcon,
} from "@/shared/components/icons";

export interface CoeNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface CoeNavGroup {
  label: string;
  items: CoeNavItem[];
}

export const COE_NAV: CoeNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/examination", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "Examinations",
    items: [
      { href: "/examination/exams", label: "Examinations", icon: GraduationCapIcon },
      { href: "/examination/timetable", label: "Timetables", icon: CalendarIcon },
    ],
  },
  {
    label: "Conduct",
    items: [
      { href: "/examination/seating", label: "Halls & seating", icon: GridIcon },
      { href: "/examination/invigilators", label: "Invigilators", icon: PeopleIcon },
      { href: "/examination/malpractice", label: "Malpractice", icon: AlertTriangleIcon },
    ],
  },
  {
    label: "Evaluation",
    items: [
      { href: "/examination/marks", label: "Marks entry", icon: PencilIcon },
      { href: "/examination/records", label: "Mark records", icon: FileTextIcon },
      { href: "/examination/results", label: "Results", icon: AwardIcon },
      { href: "/examination/revaluation", label: "Revaluation", icon: RefreshIcon },
    ],
  },
  {
    label: "Administration",
    items: [{ href: "/examination/reports", label: "Reports", icon: BarChartIcon }],
  },
  {
    label: "System",
    items: [{ href: "/examination/settings", label: "Settings", icon: CogIcon }],
  },
];

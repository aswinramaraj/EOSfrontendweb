import type { ComponentType, SVGProps } from "react";
import {
  AwardIcon,
  BarChartIcon,
  BellIcon,
  BookIcon,
  BriefcaseIcon,
  BusIcon,
  CalendarCheckIcon,
  ClipboardIcon,
  ClockIcon,
  CogIcon,
  DashboardIcon,
  FileTextIcon,
  FolderIcon,
  GraduationCapIcon,
  HomeIcon,
  LayersIcon,
  PeopleIcon,
  PersonIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
  TargetIcon,
  UserCheckIcon,
  UserPlusIcon,
  WalletIcon,
} from "@/shared/components/icons";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Not wired up yet — rendered as a disabled row instead of a link. */
  soon?: boolean;
  /** Small count shown at the end of the row (e.g. a live roll count). */
  badge?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: DashboardIcon },
      { href: "/admin/analytics", label: "Analytics", icon: BarChartIcon, soon: true },
      { href: "/admin/reports", label: "Reports", icon: FileTextIcon, soon: true },
    ],
  },
  {
    label: "Student Lifecycle",
    items: [
      { href: "/admin/students", label: "Students", icon: PeopleIcon },
      { href: "/admin/admissions", label: "Admissions", icon: UserPlusIcon, soon: true },
      { href: "/admin/enrollment", label: "Enrollment", icon: UserCheckIcon, soon: true },
      { href: "/admin/alumni", label: "Alumni", icon: GraduationCapIcon, soon: true },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/admin/academics", label: "Academic structure", icon: LayersIcon },
      { href: "/admin/attendance", label: "Attendance", icon: CalendarCheckIcon, soon: true },
      { href: "/admin/marks", label: "Marks & Grades", icon: ClipboardIcon, soon: true },
      { href: "/admin/examinations", label: "Examinations", icon: AwardIcon, soon: true },
      { href: "/admin/faculty", label: "Faculty", icon: PersonIcon, soon: true },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/admin/fees", label: "Fees & Finance", icon: WalletIcon, soon: true },
      { href: "/admin/scholarships", label: "Scholarships", icon: StarIcon, soon: true },
      { href: "/library", label: "Library", icon: BookIcon },
      { href: "/hostel", label: "Hostel", icon: HomeIcon },
      { href: "/admin/transport", label: "Transport", icon: BusIcon, soon: true },
      { href: "/admin/medical", label: "Medical", icon: StethoscopeIcon, soon: true },
    ],
  },
  {
    label: "Outcomes",
    items: [
      { href: "/admin/placement", label: "Placements", icon: BriefcaseIcon, soon: true },
      { href: "/admin/internships", label: "Internships", icon: TargetIcon, soon: true },
      { href: "/admin/certificates", label: "Certificates", icon: AwardIcon, soon: true },
      { href: "/admin/documents", label: "Documents", icon: FolderIcon, soon: true },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/notifications", label: "Notification Centre", icon: BellIcon, soon: true },
      { href: "/admin/users", label: "User Management", icon: PeopleIcon, soon: true },
      { href: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheckIcon, soon: true },
      { href: "/admin/audit", label: "Audit Logs", icon: ClockIcon, soon: true },
      { href: "/admin/settings", label: "System Config", icon: CogIcon, soon: true },
    ],
  },
];

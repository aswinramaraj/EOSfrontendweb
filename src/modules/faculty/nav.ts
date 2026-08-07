import type { ComponentType, SVGProps } from "react";
import { ClockIcon, CogIcon, FileTextIcon, LayersIcon, PeopleIcon } from "@/shared/components/icons";

export interface FacultyNavItem {
  id: string;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  soon?: boolean;
}

export interface FacultyNavGroup {
  label?: string;
  items: FacultyNavItem[];
}

// Scoped to the Faculty module's own features only — mirrors how
// LIBRARY_NAV only lists library sub-sections, not the whole app. The rest
// of the admin console (the hub an admin lands on after login, with
// Students/Fees/Hostel/etc.) is a separate build and isn't part of this
// module's sidebar.
export const FACULTY_NAV: FacultyNavGroup[] = [
  {
    label: "Overview",
    items: [{ id: "all-faculty", label: "All Faculty", href: "/admin/faculty", icon: PeopleIcon }],
  },
  {
    label: "Academic Operations",
    items: [
      { id: "attendance", label: "Attendance", href: "/admin/faculty/attendance", icon: ClockIcon },
      {
        id: "assignments",
        label: "Academic Assignments",
        href: "/admin/faculty/assignments",
        icon: LayersIcon,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "reports", label: "Reports", href: "/admin/faculty/reports", icon: FileTextIcon },
      { id: "settings", label: "Settings", href: "/admin/faculty/settings", icon: CogIcon },
    ],
  },
];

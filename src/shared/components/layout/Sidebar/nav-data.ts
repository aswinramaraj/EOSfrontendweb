import type { ICON_PATHS } from "../icon-paths";

export interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof ICON_PATHS;
  href?: string;
  soon?: boolean;
  badge?: string;
  badgeTone?: "alert" | "brand";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/" },
      { id: "analytics", label: "Analytics", icon: "barChart", soon: true },
      { id: "reports", label: "Reports", icon: "fileText", soon: true },
    ],
  },
  {
    label: "Student Lifecycle",
    items: [
      { id: "students", label: "Students", icon: "users", badge: "48" },
      { id: "admissions", label: "Admissions", icon: "userPlus", soon: true },
      { id: "enrollment", label: "Enrollment", icon: "userCheck", soon: true },
      { id: "alumni", label: "Alumni", icon: "graduation", soon: true },
    ],
  },
  {
    label: "Academics",
    items: [
      { id: "departments", label: "Departments", icon: "building", soon: true },
      { id: "programmes", label: "Programmes", icon: "layers", soon: true },
      { id: "courses", label: "Courses", icon: "bookOpen", soon: true },
      { id: "attendance", label: "Attendance", icon: "calendarCheck", soon: true },
      { id: "marks", label: "Marks & Grades", icon: "clipboard", soon: true },
      { id: "examinations", label: "Examinations", icon: "award", soon: true },
      { id: "faculty", label: "Faculty", icon: "user", soon: true },
    ],
  },
  {
    label: "Services",
    items: [
      { id: "fees", label: "Fees & Finance", icon: "wallet", href: "/fees", badge: "9", badgeTone: "alert" },
      { id: "scholarships", label: "Scholarships", icon: "star", soon: true },
      { id: "library", label: "Library", icon: "book", soon: true },
      { id: "hostel", label: "Hostel", icon: "home", soon: true },
      { id: "transport", label: "Transport", icon: "bus", soon: true },
      { id: "medical", label: "Medical", icon: "stethoscope", soon: true },
    ],
  },
  {
    label: "Outcomes",
    items: [
      { id: "placement", label: "Placements", icon: "briefcase", soon: true },
      { id: "internships", label: "Internships", icon: "target", soon: true },
    ],
  },
];

export const SESSION = {
  name: "Meera Raghavan",
  role: "Registrar · Super Admin",
  initials: "MR",
  institution: "Sri Eshwar College of Engineering",
  academicYear: "2026–27",
  term: "Odd Semester",
};

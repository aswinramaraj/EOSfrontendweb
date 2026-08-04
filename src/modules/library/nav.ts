import type { ComponentType, SVGProps } from "react";
import {
  AlertTriangleIcon,
  BarChartIcon,
  BookIcon,
  ClockIcon,
  CogIcon,
  DashboardIcon,
  FileTextIcon,
  LayersIcon,
  PeopleIcon,
  SwapIcon,
  UndoIcon,
} from "@/shared/components/icons";

export interface LibraryNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export interface LibraryNavGroup {
  label: string;
  items: LibraryNavItem[];
}

export const LIBRARY_NAV: LibraryNavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/library", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/library/books", label: "Books", icon: BookIcon },
      { href: "/library/ebooks", label: "eBooks", icon: FileTextIcon },
      {
        href: "/library/catalogue-setup",
        label: "Categories & racks",
        icon: LayersIcon,
      },
    ],
  },
  {
    label: "Circulation",
    items: [
      { href: "/library/issue", label: "Issue books", icon: SwapIcon },
      { href: "/library/returns", label: "Returns & renewals", icon: UndoIcon },
      {
        href: "/library/overdue",
        label: "Overdue & fines",
        icon: AlertTriangleIcon,
      },
      {
        href: "/library/lost",
        label: "Lost & damaged books",
        icon: AlertTriangleIcon,
      },
      { href: "/library/history", label: "Borrowing history", icon: ClockIcon },
    ],
  },
  {
    label: "Members",
    items: [{ href: "/library/members", label: "Library members", icon: PeopleIcon }],
  },
  {
    label: "Administration",
    items: [
      { href: "/library/reports", label: "Reports", icon: BarChartIcon },
      { href: "/library/settings", label: "Settings", icon: CogIcon },
    ],
  },
];

const FLAT_NAV = LIBRARY_NAV.flatMap((group) => group.items);

export function getLibraryPageTitle(pathname: string): string {
  if (pathname === "/library") return "Dashboard";
  const match = FLAT_NAV.find(
    (item) => item.href !== "/library" && pathname.startsWith(item.href),
  );
  return match?.label ?? "Library";
}

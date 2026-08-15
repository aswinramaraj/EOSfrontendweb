import type { ICON_PATHS } from "../icon-paths";

export interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof ICON_PATHS;
  href?: string;
  soon?: boolean;
  badge?: string;
  badgeTone?: "alert" | "brand";
  // Sub-rows rendered indented beneath this item — used for the Fees &
  // Finance tabs (Fee Payments, Demand, Quota, ...) so each is directly
  // reachable from the sidebar, alongside the existing in-page tab bar.
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Only Fees & Finance is a real, built module right now — every other item
// from the original navigation (Students, Academics, Placements, etc.) has
// been removed rather than shown with fabricated counts/badges. Add groups
// back here as each module actually ships.
//
// Children mirror FEES_TABS (src/modules/fees/constants.ts) via the `tab`
// query param — /fees/page.tsx reads it to select the same tab the in-page
// tab bar controls, so both stay in sync without duplicating tab state.
export const NAV: NavGroup[] = [
  {
    label: "",
    items: [
      {
        id: "fees",
        label: "Fees & Finance",
        icon: "wallet",
        href: "/fees",
        children: [
          { id: "fees-fee-payments", label: "Fee Payments", icon: "wallet", href: "/fees?tab=fee-payments" },
          { id: "fees-finance-overview", label: "Finance Overview", icon: "barChart", href: "/fees?tab=finance-overview" },
          { id: "fees-demand", label: "Demand", icon: "clipboard", href: "/fees?tab=demand" },
          { id: "fees-quota", label: "Quota", icon: "layers", href: "/fees?tab=quota" },
          { id: "fees-fee-structures", label: "Fee Structures", icon: "building", href: "/fees?tab=fee-structures" },
          {
            id: "fees-fee-structure-items",
            label: "Fee Structure Items",
            icon: "fileText",
            href: "/fees?tab=fee-structure-items",
          },
        ],
      },
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

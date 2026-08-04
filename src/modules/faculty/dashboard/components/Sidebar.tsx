"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { GraduationCapIcon, ShieldCheckIcon } from "@/shared/components/icons";
import { tokenStorage } from "@/shared/lib/token-storage";
import { BookIcon, BuildingIcon, ClipboardCheckIcon, DashboardGridIcon, LogoutIcon } from "./icons";

interface NavItem {
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Omitted for the one entry with no route in scope to build yet — it
   * renders as a visual-only nav entry rather than linking to a page that
   * doesn't exist. */
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: DashboardGridIcon, href: "/faculty" },
  { label: "Attendance", icon: ClipboardCheckIcon },
  { label: "Academics", icon: BookIcon, href: "/faculty/academics" },
  { label: "No Due Clearance", icon: ShieldCheckIcon },
  { label: "Venue Booking", icon: BuildingIcon, href: "/faculty/venue-booking" },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    tokenStorage.clear();
    router.replace("/login");
  }

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
          <GraduationCapIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-tight text-slate-900">Sri Eshwar ERP</p>
          <p className="truncate text-xs text-slate-500">Subject Handling Faculty</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-4 py-2">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = href !== undefined && pathname === href;
          const className = `flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
            isActive ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`;

          if (!href) {
            return (
              <button key={label} type="button" onClick={onNavigate} className={className}>
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            );
          }

          return (
            <Link key={label} href={href} aria-current={isActive ? "page" : undefined} onClick={onNavigate} className={className}>
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
        >
          <LogoutIcon className="h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  );
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop: always visible, fixed width, part of the layout flow. */}
      <aside className="hidden h-screen w-70 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile/tablet: hidden by default, opens as an overlay drawer so the
       * content column isn't squeezed into an unusable sliver on small screens. */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={onMobileClose} aria-hidden="true" />
          <aside className="relative flex h-full w-70 max-w-[80vw] flex-col bg-white shadow-xl">
            <SidebarContent onNavigate={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  );
}

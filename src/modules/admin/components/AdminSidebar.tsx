"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeftIcon, ChevronsRightIcon, XIcon } from "@/shared/components/icons";
import { useStudentCount } from "@/modules/students/hooks/useStudentCount";
import { ADMIN_NAV } from "../nav";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function AdminSidebar({ mobileOpen, onCloseMobile, collapsed, onToggleCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  // Live roll count, not the static placeholder in nav.ts — a nav badge that
  // disagreed with the page it links to would be the first thing to erode
  // trust in every other number on this dashboard.
  const studentCount = useStudentCount({});

  function renderNav(isCollapsedRail: boolean) {
    return (
      <nav className="flex flex-col gap-1 overflow-y-auto px-4 py-4">
        {ADMIN_NAV.map((group, groupIndex) => (
          <div key={group.label} className="mb-3 flex flex-col gap-0.5">
            <div
              className={`flex items-center px-3 pb-1.5 pt-2 ${
                isCollapsedRail ? "justify-center" : "justify-between"
              }`}
            >
              {!isCollapsedRail && (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>
              )}
              {groupIndex === 0 && (
                <button
                  type="button"
                  onClick={onToggleCollapsed}
                  aria-label={isCollapsedRail ? "Expand navigation" : "Collapse navigation"}
                  title={isCollapsedRail ? "Expand navigation" : "Collapse navigation"}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  {isCollapsedRail ? (
                    <ChevronsRightIcon className="h-4 w-4" />
                  ) : (
                    <ChevronsLeftIcon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;
              const badge =
                item.href === "/admin/students"
                  ? studentCount.data !== undefined
                    ? String(studentCount.data)
                    : undefined
                  : item.badge;

              if (item.soon) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    disabled
                    title={`${item.label} — module planned`}
                    className={`flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-left text-[14.5px] font-medium text-slate-400 ${
                      isCollapsedRail ? "justify-center" : ""
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!isCollapsedRail && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-500">
                          Soon
                        </span>
                      </>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={isCollapsedRail ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                  } ${isCollapsedRail ? "justify-center" : ""}`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!isCollapsedRail && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {badge && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10.5px] font-semibold text-blue-700">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    );
  }

  return (
    <>
      <aside
        className={`hidden h-full shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-[width] duration-150 lg:flex ${
          collapsed ? "w-[68px]" : "w-65"
        }`}
      >
        {renderNav(collapsed)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-65 flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-end px-4 py-3">
              <button
                onClick={onCloseMobile}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            {renderNav(false)}
          </aside>
        </div>
      )}
    </>
  );
}

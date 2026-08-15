"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeftIcon, XIcon } from "@/shared/components/icons";
import { useHrDashboard } from "../hooks/useHrDashboard";
import { useHrPayroll } from "../hooks/useHrPayroll";
import { useHrRequests } from "../hooks/useHrRequests";
import { usePayslipRequests } from "../hooks/usePayslipRequests";
import { HR_NAV } from "../nav";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

interface HRSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const BADGE_TONE_CLASS = {
  red: "bg-red-600 text-white",
  blue: "bg-blue-100 text-blue-700",
} as const;

export function HRSidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: HRSidebarProps) {
  const pathname = usePathname();
  const { data: summary } = useHrDashboard();
  // total_active_faculty - processed_count (from the dashboard summary) counts
  // faculty who don't have a payroll record for this month at all — not the
  // same thing as "records that exist but aren't marked paid yet", which is
  // what the Payroll page itself calls "Pending". Fetching the real records
  // here keeps the sidebar badge honest against that same definition instead
  // of showing a number nothing on the Payroll page actually corresponds to.
  const { data: payrollData } = useHrPayroll({ month: currentMonth(), limit: 100 });
  const unpaidPayrollCount = payrollData?.data.filter((r) => r.paid_at === null).length ?? 0;

  // "pending_requests_count" includes requests still stuck at HOD, which HR
  // can't act on yet — the sidebar badge should only ever count what's
  // actually an HR task right now, same definition as the Dashboard's
  // Pending Actions drawer.
  const { data: requestsData } = useHrRequests({ status: "pending", limit: 100 });
  const actionableRequestsCount = (requestsData?.data ?? []).filter(
    (r) => r.hod_approval_status === "approved" && r.hr_approval_status === "pending",
  ).length;

  const { data: payslipData } = usePayslipRequests({ status: "pending", limit: 100 });
  const pendingPayslipCount = payslipData?.data.length ?? 0;

  const pendingAppraisalsCount = summary?.pending_appraisals_count ?? 0;

  const badgeByHref: Record<string, number | undefined> = {
    "/hr/requests": actionableRequestsCount > 0 ? actionableRequestsCount : undefined,
    "/hr/employee-reviews": pendingAppraisalsCount > 0 ? pendingAppraisalsCount : undefined,
    "/hr/payroll": unpaidPayrollCount > 0 ? unpaidPayrollCount : undefined,
    "/hr/payslip-requests": pendingPayslipCount > 0 ? pendingPayslipCount : undefined,
  };

  const content = (
    <>
      <div className="flex items-center justify-end px-4 py-3 lg:hidden">
        <button
          onClick={onCloseMobile}
          className="text-slate-400 hover:text-slate-600"
          aria-label="Close menu"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto px-4 py-4">
        {HR_NAV.map((group, groupIndex) => (
          <div key={group.label} className="mb-3 flex flex-col gap-0.5">
            <div className="flex items-center justify-between px-3 pb-1.5 pt-2">
              {!collapsed && (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.label}
                </p>
              )}
              {groupIndex === 0 && (
                <button
                  onClick={onToggleCollapsed}
                  className={`hidden rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 lg:inline-flex ${
                    collapsed ? "mx-auto" : ""
                  }`}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  <ChevronsLeftIcon className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>

            {group.items.map((item) => {
              const active = item.href === "/hr" ? pathname === "/hr" : pathname.startsWith(item.href);
              const Icon = item.icon;
              const badge = badgeByHref[item.href] ?? item.badge;

              if (item.soon) {
                return (
                  <span
                    key={item.href}
                    title={collapsed ? `${item.label} — coming soon` : "Coming soon"}
                    className={`flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2.5 text-[14.5px] font-bold text-slate-400 ${
                      collapsed ? "justify-center" : ""
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {badge != null && (
                          <span
                            className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none ${BADGE_TONE_CLASS[item.badgeTone ?? "blue"]}`}
                          >
                            {badge}
                          </span>
                        )}
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Soon
                        </span>
                      </>
                    )}
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[14.5px] font-bold transition-colors ${
                    collapsed ? "justify-center" : ""
                  } ${active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {badge != null && (
                        <span
                          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none ${BADGE_TONE_CLASS[item.badgeTone ?? "blue"]}`}
                        >
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
    </>
  );

  return (
    <>
      <aside
        className={`hidden h-full shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-[width] lg:flex ${
          collapsed ? "w-18" : "w-65"
        }`}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={onCloseMobile} aria-hidden="true" />
          <aside className="relative flex h-full w-65 flex-col overflow-y-auto bg-white shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

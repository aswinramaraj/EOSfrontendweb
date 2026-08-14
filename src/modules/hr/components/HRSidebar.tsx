"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, LogOutIcon, XIcon } from "@/shared/components/icons";
import { HOVERABLE_RING } from "./ui/hoverable";
import type { AuthUser } from "@/modules/auth/types";
import { displayNameFromEmail, initialsFromName } from "../lib/hr-display-name";
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
  user: AuthUser;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

const BADGE_TONE_CLASS = {
  red: "bg-red-600 text-white",
  blue: "bg-[#2655DA] text-white",
} as const;

function roleLabel(role: string): string {
  return role
    .split("_")
    .map((word) => (word === "hr" ? "HR" : word[0]?.toUpperCase() + word.slice(1)))
    .join(" ");
}

export function HRSidebar({ user, mobileOpen, onCloseMobile, onLogout }: HRSidebarProps) {
  const pathname = usePathname();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { data: summary } = useHrDashboard();
  const { data: payrollData } = useHrPayroll({ month: currentMonth(), limit: 100 });
  const unpaidPayrollCount = payrollData?.data.filter((r) => r.paid_at === null).length ?? 0;

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

  const displayName = displayNameFromEmail(user.email);
  const initials = initialsFromName(displayName);

  const navBlock = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
      {HR_NAV.map((group) => (
        <div key={group.label} className="mb-3 flex flex-col gap-0.5">
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </p>

          {group.items.map((item) => {
            const active = item.href === "/hr" ? pathname === "/hr" : pathname.startsWith(item.href);
            const Icon = item.icon;
            const badge = badgeByHref[item.href] ?? item.badge;

            if (item.soon) {
              return (
                <span
                  key={item.href}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-semibold text-slate-400"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-[14px] font-semibold ${HOVERABLE_RING} ${
                  active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {badge != null && (
                  <span
                    className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold leading-none ${BADGE_TONE_CLASS[item.badgeTone ?? "blue"]}`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const identityBlock = (
    <div className="relative border-t border-slate-200 p-3">
      {accountMenuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setAccountMenuOpen(false)} aria-hidden="true" />
          <div className="absolute bottom-full left-3 right-3 z-20 mb-2 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOutIcon className="h-4 w-4" />
              Log out
            </button>
          </div>
        </>
      )}
      <button
        type="button"
        onClick={() => setAccountMenuOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">
          {initials}
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-sm font-bold text-slate-900">{displayName}</span>
          <span className="block truncate text-xs text-slate-500">{roleLabel(user.role)}</span>
        </span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
      </button>
    </div>
  );

  return (
    <>
      <aside className="hidden h-full w-70 shrink-0 flex-col overflow-visible border-r border-slate-200 bg-white lg:flex">
        {navBlock}
        {identityBlock}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={onCloseMobile} aria-hidden="true" />
          <aside className="relative flex h-full w-70 flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-end px-3 pt-3">
              <button onClick={onCloseMobile} className="text-slate-400 hover:text-slate-600" aria-label="Close menu">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            {navBlock}
            {identityBlock}
          </aside>
        </div>
      )}
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, XIcon } from "@/shared/components/icons";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { AuthUser } from "@/modules/auth/types";
import { useSecretaryDashboardSummary } from "@/modules/secretary/dashboard/hooks/useDashboardSummary";
import { SECRETARY_NAV } from "../nav";

interface SecretarySidebarProps {
  user: AuthUser;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function SecretarySidebar({
  user,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SecretarySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: summary } = useSecretaryDashboardSummary();

  const unmarkedToday = summary
    ? Math.max(summary.attendance_today.scheduled_sessions - summary.attendance_today.marked_sessions, 0)
    : 0;
  const navBadges: Record<string, number> = {
    "/secretary/attendance": unmarkedToday,
    "/secretary/venue-booking": summary?.pending_requests.venue_bookings ?? 0,
  };

  function handleLogout() {
    queryClient.clear();
    tokenStorage.clear();
    router.replace("/login");
  }

  const content = (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-5">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/assest/secelogo.png"
            alt="Sri Eshwar College of Engineering logo"
            width={148}
            height={148}
            className="h-10 w-10 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight text-slate-900">
              Secretary Portal
            </p>
            <p className="truncate text-[12.5px] font-medium leading-tight text-blue-700">
              Sri Eshwar College Of Engineering
            </p>
            <p className="truncate text-[10.5px] font-semibold uppercase tracking-wide text-slate-400">
              ERP Administration
            </p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="text-slate-400 hover:text-slate-600 lg:hidden"
          aria-label="Close menu"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-[3px] overflow-y-auto px-3 py-3.5">
        {SECRETARY_NAV.map((group) => (
          <div key={group.label} className="flex flex-col gap-[3px]">
            <p className="px-2 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active =
                item.href === "/secretary"
                  ? pathname === "/secretary"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              const badge = navBadges[item.href];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-[11px] rounded-[10px] px-[11px] py-[9px] text-[14.5px] font-medium transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-[17px] w-[17px] shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {badge > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3.5">
        <div className="mb-3 flex items-center gap-[11px]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[13px] font-semibold text-white">
            {user.email.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14.5px] font-semibold leading-tight text-slate-900">
              {user.email}
            </p>
            <p className="truncate text-[11.5px] leading-tight text-slate-500">
              Portal Administrator
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
        >
          <LogOutIcon className="h-[15px] w-[15px]" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        className={`hidden h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:flex ${
          collapsed ? "w-0 border-r-0" : "w-67"
        }`}
      >
        <div className="flex h-full w-67 flex-col">{content}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative flex h-full w-67 flex-col bg-white shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, MenuIcon, PlusIcon, ShieldIcon } from "@/shared/components/icons";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { facultyService } from "@/modules/faculty/services/faculty.service";
import { facultyKeys } from "@/modules/faculty/query-keys";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import type { AuthUser } from "@/modules/auth/types";
import { useHrDashboard } from "../hooks/useHrDashboard";
import { MONTH_LABELS, useHRPeriod } from "./HRPeriodContext";

interface HRTopbarProps {
  user: AuthUser;
  onOpenMobileNav: () => void;
}

/** Single fixed header row per the reference design — brand block (aligned
 *  to the sidebar's width, so the vertical divider between them lines up
 *  with the sidebar's own right border below), global search, and the
 *  period/quick-action pills. Replaces the earlier two-row look where the
 *  brand lived in the sidebar instead of this bar. */
export function HRTopbar({ user, onOpenMobileNav }: HRTopbarProps) {
  void user; // kept in the prop contract in case a future topbar affordance needs it
  const router = useRouter();
  const { month, year } = useHRPeriod();
  const { data: summary } = useHrDashboard();
  const hasNotifications = (summary?.pending_requests_count ?? 0) > 0 || (summary?.pending_appraisals_count ?? 0) > 0;

  const [query, setQuery] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query);
  const trimmedQuery = debouncedQuery.trim();
  const searchActive = trimmedQuery.length >= 2;
  // Calls the service directly (not the shared useFaculties hook, which has
  // no `enabled` escape hatch) so this only fires once there's a real query
  // — not on every keystroke-less render while the box is empty.
  const { data: searchResults, isLoading: searching } = useQuery({
    queryKey: facultyKeys.list({ search: trimmedQuery, limit: 6 }),
    queryFn: () => facultyService.list({ search: trimmedQuery, limit: 6 }),
    enabled: searchActive,
  });

  function goToFaculty(id: number) {
    setResultsOpen(false);
    setQuery("");
    router.push(`/hr/faculty-directory/${id}`);
  }

  function handleSubmit() {
    if (!query.trim()) return;
    setResultsOpen(false);
    router.push(`/hr/faculty-directory?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="relative z-20 flex shrink-0 items-stretch border-b border-slate-200 bg-white">
      <div className="flex w-70 shrink-0 items-center gap-3 border-r border-slate-200 px-4 py-3">
        <Image
          src="/assest/secelogo.png"
          alt="Sri Eshwar College of Engineering logo"
          width={148}
          height={148}
          className="h-9 w-9 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">Sri Eshwar</p>
          <p className="truncate text-xs text-slate-500">Human Resources</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4 px-6 py-3">
        <button onClick={onOpenMobileNav} className="text-slate-500 hover:text-slate-700 lg:hidden" aria-label="Open menu">
          <MenuIcon className="h-6 w-6" />
        </button>

        <div className="relative max-w-md flex-1">
          <SearchInput
            placeholder="Search faculty, requests, payslips…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResultsOpen(true);
            }}
            onFocus={() => setResultsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") setResultsOpen(false);
            }}
          />

          {resultsOpen && searchActive && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setResultsOpen(false)} aria-hidden="true" />
              <div className="absolute left-0 top-full z-20 mt-2 w-full min-w-[320px] rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                {searching && <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>}
                {!searching && (searchResults?.data.length ?? 0) === 0 && (
                  <p className="px-3 py-2 text-sm text-slate-500">No faculty match &quot;{debouncedQuery}&quot;.</p>
                )}
                {!searching &&
                  searchResults?.data.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => goToFaculty(member.id)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-slate-50"
                    >
                      <FacultyAvatar faculty={member} className="h-8 w-8 shrink-0 rounded-full text-xs" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">{fullName(member)}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {member.designation} · {member.department?.name ?? "—"}
                        </span>
                      </span>
                    </button>
                  ))}
                {!searching && (searchResults?.meta.total ?? 0) > (searchResults?.data.length ?? 0) && (
                  <button
                    onClick={handleSubmit}
                    className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-blue-700 hover:bg-slate-50"
                  >
                    View all {searchResults?.meta.total} results →
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 sm:inline-flex">
            <ShieldIcon className="h-4 w-4 text-blue-700" />
            HR · Payroll
          </span>

          <span className="hidden rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 md:inline-flex">
            {year}–{String((year + 1) % 100).padStart(2, "0")}
          </span>

          <span className="rounded-full bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white">
            {MONTH_LABELS[month - 1]}
          </span>

          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Notifications"
          >
            <BellIcon className="h-[18px] w-[18px]" />
            {hasNotifications && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#2655DA] ring-2 ring-white" />
            )}
          </button>

          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 sm:flex"
            aria-label="Quick add"
          >
            <PlusIcon className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}

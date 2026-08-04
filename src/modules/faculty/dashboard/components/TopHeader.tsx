"use client";

import { useState } from "react";
import { ShieldCheckIcon } from "@/shared/components/icons";
import type { DashboardProfile, SectionStatus } from "../types/dashboard.types";
import { FacultyProfileDropdown } from "./FacultyProfileDropdown";
import { BellIcon, MenuIcon, SearchIcon } from "./icons";

interface TopHeaderProps {
  profileStatus: SectionStatus;
  profile: DashboardProfile | null;
  profileError: string | null;
  onProfileRetry: () => void;
  onMenuClick: () => void;
}

export function TopHeader({ profileStatus, profile, profileError, onProfileRetry, onMenuClick }: TopHeaderProps) {
  const [search, setSearch] = useState("");

  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:gap-6 sm:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="flex flex-1 justify-center">
        <label className="relative w-full max-w-xl">
          <span className="sr-only">Search modules, students, subjects, books</span>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules, students, subjects, books..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <span className="hidden items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:inline-flex">
          <ShieldCheckIcon className="h-4 w-4" />
          Subject Handling Faculty
        </span>

        {/* No unread-count badge: the backend has no notifications list endpoint
         * yet (only an unimplemented WebSocket stub), so a number here would be
         * fabricated. */}
        <button type="button" aria-label="Notifications" className="text-slate-500 transition hover:text-slate-700">
          <BellIcon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 border-l border-slate-100 pl-4">
          <FacultyProfileDropdown
            status={profileStatus}
            profile={profile}
            error={profileError}
            onRetry={onProfileRetry}
          />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{profile?.fullName ?? "…"}</p>
            <p className="text-xs text-slate-500">
              {profile?.departmentCode ?? "—"}
              {profile?.academicYear ? ` · AY ${profile.academicYear}` : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

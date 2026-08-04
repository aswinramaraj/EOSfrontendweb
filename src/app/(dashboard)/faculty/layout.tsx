"use client";

import { useState } from "react";
import { useFacultyDashboardProfile } from "@/modules/faculty/dashboard/hooks/dashboard.hooks";
import { Sidebar } from "@/modules/faculty/dashboard/components/Sidebar";
import { TopHeader } from "@/modules/faculty/dashboard/components/TopHeader";

/** Shared shell (sidebar + top header) for every /faculty/* page — split out
 * of FacultyDashboard so the profile fetch and mobile-menu state aren't
 * re-created per page. */
export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { status: profileStatus, profile, error: profileError, retry: retryProfile } = useFacultyDashboardProfile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          profileStatus={profileStatus}
          profile={profile}
          profileError={profileError}
          onProfileRetry={retryProfile}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

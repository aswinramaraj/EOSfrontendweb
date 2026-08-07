"use client";

import { Suspense, useState, type ReactNode } from "react";
import { Sidebar } from "../Sidebar/Sidebar";
import { Topbar } from "../Topbar/Topbar";

// Mirrors LibraryShell/HostelShell's flex column (gradient topbar + sidebar
// row) layout and mobile-nav-overlay behavior, so Fees & Finance's chrome
// looks and behaves the same as every other module's.
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50">
      <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} />
      <div className="flex min-h-0 flex-1">
        {/* Sidebar reads the `tab` query param (useSearchParams) to highlight
            the active Fees & Finance sub-row — needs a Suspense boundary. */}
        <Suspense fallback={null}>
          <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
        </Suspense>
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

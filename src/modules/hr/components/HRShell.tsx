"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { tokenStorage } from "@/shared/lib/token-storage";
import { HRSidebar } from "./HRSidebar";
import { HRTopbar } from "./HRTopbar";
import { HRPeriodProvider } from "./HRPeriodContext";

// HR is a standalone login — unlike the other modules, admin accounts are
// deliberately not given a back door in here.
const ALLOWED_ROLES = new Set(["hr_payroll"]);

export function HRShell({ children }: { children: React.ReactNode }) {
  const user = useAuthUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const allowed = user != null && ALLOWED_ROLES.has(user.role);

  useEffect(() => {
    if (user === undefined) return; // not hydrated yet — do nothing
    if (user === null) {
      router.replace("/login");
      return;
    }
    if (!allowed) {
      router.replace("/");
    }
  }, [user, allowed, router]);

  function handleLogout() {
    queryClient.clear();
    tokenStorage.clear();
    router.replace("/login");
  }

  if (user === undefined) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (user === null || !allowed) {
    return null;
  }

  return (
    <HRPeriodProvider>
      <div
        className="hr-shell flex h-screen w-full flex-col overflow-hidden bg-slate-50"
        style={{ fontFamily: "var(--font-hr-sans)" }}
      >
        <HRTopbar user={user} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <HRSidebar
            user={user}
            mobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
            onLogout={handleLogout}
          />
          <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">{children}</main>
        </div>
      </div>
    </HRPeriodProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { tokenStorage } from "@/shared/lib/token-storage";
import { AdvisorSidebar } from "./AdvisorSidebar";
import { AdvisorTopbar } from "./AdvisorTopbar";

// class_mentors self-service is exposed to both Faculty and HoD (an HoD who
// also mentors a class), matching the backend's own @Roles(FACULTY, HOD).
const ALLOWED_ROLES = new Set(["faculty", "hod"]);

export function AdvisorShell({ children }: { children: React.ReactNode }) {
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
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50">
      <AdvisorTopbar user={user} onOpenMobileNav={() => setMobileNavOpen(true)} onLogout={handleLogout} />
      <div className="flex min-h-0 flex-1">
        <AdvisorSidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

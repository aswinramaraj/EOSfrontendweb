"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { tokenStorage } from "@/shared/lib/token-storage";
import { AcademicCoordinatorSidebar } from "./AcademicCoordinatorSidebar";
import { AcademicCoordinatorTopbar } from "./AcademicCoordinatorTopbar";
import { AcademicYearProvider } from "../context/AcademicYearContext";

const ALLOWED_ROLES = new Set(["academic_coordinator", "admin"]);
const COLLAPSE_STORAGE_KEY = "eos.academic-coordinator.sidebar.collapsed";

export function AcademicCoordinatorShell({ children }: { children: React.ReactNode }) {
  const user = useAuthUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1",
  );

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

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
    <AcademicYearProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
        <AcademicCoordinatorTopbar user={user} onLogout={handleLogout} />
        <div className="flex min-h-0 flex-1">
          <AcademicCoordinatorSidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
          <main className="min-w-0 flex-1 overflow-y-auto" style={{ padding: "24px 26px 48px 26px" }}>
            {children}
          </main>
        </div>
      </div>
    </AcademicYearProvider>
  );
}

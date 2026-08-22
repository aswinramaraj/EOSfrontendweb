"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { tokenStorage } from "@/shared/lib/token-storage";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

const ALLOWED_ROLES = new Set(["admin"]);
const COLLAPSE_STORAGE_KEY = "eos.admin.sidebar.collapsed";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const user = useAuthUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  // Lazy initializer, not an effect: reads once on mount, same value on every
  // subsequent render — an effect here would just be a second render to set
  // state we already know synchronously.
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
    // Explicit color/background, not just Tailwind's bg-white: without an
    // explicit `color`, text with none of its own (headings, stat values)
    // inherits `body`'s `--foreground`, which globals.css flips to a light
    // gray under `prefers-color-scheme: dark` — washing them out. Same fix
    // as the Placement module's root layout.
    <div className="flex h-screen w-full flex-col overflow-hidden" style={{ color: "#14181f", background: "#ffffff" }}>
      <AdminTopbar user={user} onLogout={handleLogout} />
      <div className="flex min-h-0 flex-1">
        <AdminSidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="min-w-0 flex-1 overflow-y-auto" style={{ padding: "24px 26px 48px 26px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { SecretarySidebar } from "./SecretarySidebar";
import { SecretaryTopbar } from "./SecretaryTopbar";
import { getSecretaryPageTitle } from "../nav";

const ALLOWED_ROLES = new Set(["secretary"]);

export function SecretaryShell({ children }: { children: React.ReactNode }) {
  const user = useAuthUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="flex h-screen w-full overflow-hidden bg-[#fcfcfd]">
      <SecretarySidebar
        user={user}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <SecretaryTopbar
          user={user}
          title={getSecretaryPageTitle(pathname)}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileNavOpen(true);
            } else {
              setSidebarCollapsed((prev) => !prev);
            }
          }}
        />
        <main className="min-w-0 flex-1 overflow-y-auto px-[26px] pt-[26px] pb-14">{children}</main>
      </div>
    </div>
  );
}

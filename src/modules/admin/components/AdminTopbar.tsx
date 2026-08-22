"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogOutIcon, ShieldCheckIcon } from "@/shared/components/icons";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { AuthUser } from "@/modules/auth/types";

interface AdminTopbarProps {
  user: AuthUser;
  onLogout: () => void;
}

function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function AdminTopbar({ user, onLogout }: AdminTopbarProps) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roleMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) setRoleMenuOpen(false);
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [roleMenuOpen]);

  return (
    <header
      style={{ borderBottom: "1px solid #e6eaf1", padding: "11px 18px" }}
      className="flex flex-wrap items-center gap-2.5 bg-white"
    >
      <div className="flex flex-none items-center gap-3" style={{ height: 44 }}>
        <Image
          src="/assest/secelogo.png"
          alt="Sri Eshwar College of Engineering"
          width={64}
          height={64}
          style={{ width: 38, height: 38, objectFit: "contain", flexShrink: 0, display: "block" }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#16224a", letterSpacing: "-.5px", lineHeight: 1.1 }}>Sri Eshwar</div>
          <div style={{ fontSize: 11.5, color: "#8b95a6", marginTop: 2, lineHeight: 1.2 }}>College of Engineering</div>
        </div>
      </div>

      <div className="relative ml-auto flex-none" ref={roleMenuRef}>
        <button
          onClick={() => setRoleMenuOpen((o) => !o)}
          style={{ display: "flex", alignItems: "center", gap: 8, height: 44, borderRadius: 22, background: "#e8f0fe", padding: "0 14px" }}
        >
          <ShieldCheckIcon style={{ width: 18, height: 18, color: "#1f4fd8" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1f4fd8" }}>{roleLabel(user.role)}</span>
        </button>
        {roleMenuOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] w-52 overflow-hidden rounded-[10px] border border-[#dfe4ec] bg-white py-1 shadow-[0_20px_44px_rgba(16,24,40,.14)]">
            <p className="truncate px-3.5 py-2 text-xs text-[#8b95a6]">{user.email}</p>
            <button
              onClick={() => {
                setRoleMenuOpen(false);
                setConfirmingLogout(true);
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium text-[#2c3542] hover:bg-[#f3f6fb]"
            >
              <LogOutIcon className="h-4 w-4" /> Sign out
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmingLogout}
        title="Sign out?"
        message="You'll need to log in again to access the Admin Console."
        confirmLabel="Sign out"
        tone="danger"
        onConfirm={onLogout}
        onClose={() => setConfirmingLogout(false)}
      />
    </header>
  );
}

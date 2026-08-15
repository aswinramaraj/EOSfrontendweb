"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CogIcon, BellIcon, LogOutIcon, ShieldCheckIcon } from "@/shared/components/icons";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import type { AuthUser } from "@/modules/auth/types";
import { useUnreadNotificationsCount } from "../hooks/useNotifications";
import { useCompanies } from "../hooks/useCompanies";
import { useDrives } from "../hooks/useDrives";
import { useEligibleStudents } from "../hooks/useEligibleStudents";

interface PlacementTopbarProps {
  user: AuthUser;
  onLogout: () => void;
}

/** June-cutoff academic year/semester — same convention used across the ERP's other modules. Purely computed, not a real switchable setting (no backend concept of "current cycle" to switch against). */
function currentAcademicCycle(): { year: string; semester: string } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const startYear = month >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  const isOdd = month >= 6 && month <= 11;
  return { year: `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`, semester: isOdd ? "Odd Semester" : "Even Semester" };
}

function roleLabel(role: string): string {
  if (role === "placement") return "Placement Officer";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

interface ResultRow {
  key: string;
  kind: "STUDENT" | "COMPANY" | "DRIVE";
  title: string;
  meta: string;
  href: string;
}

const ICON_BTN_STYLE: React.CSSProperties = {
  width: 44,
  height: 44,
  border: "1px solid #e6eaf1",
  borderRadius: 12,
};

export function PlacementTopbar({ user, onLogout }: PlacementTopbarProps) {
  const router = useRouter();
  const unreadCount = useUnreadNotificationsCount();
  const { year, semester } = currentAcademicCycle();
  const [gq, setGq] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQ(gq.trim()), 250);
    return () => clearTimeout(timer);
  }, [gq]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (!roleMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) setRoleMenuOpen(false);
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [roleMenuOpen]);

  // Clears both the raw and debounced query in the same tick — clearing only
  // `gq` left the input visibly empty while the dropdown (gated on
  // `debouncedQ`) kept showing the stale results for another 250ms, which
  // read as the results panel flickering open/closed on its own.
  function closeSearch() {
    setGq("");
    setDebouncedQ("");
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) closeSearch();
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const students = useEligibleStudents();
  const drives = useDrives();
  const companies = useCompanies({ q: debouncedQ.length >= 2 ? debouncedQ : undefined, page_size: 6 });

  const results: ResultRow[] = useMemo(() => {
    if (debouncedQ.length < 2) return [];
    const needle = debouncedQ.toLowerCase();

    const studentRows: ResultRow[] = (students.data ?? [])
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(needle) ||
          s.studentIdNo.toLowerCase().includes(needle) ||
          s.rollNo?.toLowerCase().includes(needle),
      )
      .slice(0, 6)
      .map((s) => ({
        key: `student-${s.id}`,
        kind: "STUDENT",
        title: s.name ?? s.studentIdNo,
        meta: [s.studentIdNo, s.departmentName].filter(Boolean).join(" · "),
        // The students list page never reads a ?q= filter — it only
        // understands ?class=. Route straight to the student's own detail
        // page instead, which is the actual destination the click implies.
        href: `/placement/students/${s.id}`,
      }));

    const companyRows: ResultRow[] = (companies.data?.data ?? []).slice(0, 6).map((c) => ({
      key: `company-${c.id}`,
      kind: "COMPANY",
      title: c.name,
      // profile_info/industry/location are real once seeded, but frequently
      // null right now — fall through to whichever is actually populated
      // rather than rendering a blank meta line.
      meta: c.profileInfo || [c.industry, c.location].filter(Boolean).join(" · ") || "",
      href: "/placement/companies",
    }));

    const driveRows: ResultRow[] = (drives.data ?? [])
      .filter((d) => d.companyName.toLowerCase().includes(needle) || d.role?.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((d) => ({
        key: `drive-${d.id}`,
        kind: "DRIVE",
        title: [d.companyName, d.role].filter(Boolean).join(" · "),
        meta: d.scheduledDate,
        href: `/placement/drives/${d.id}`,
      }));

    return [...studentRows, ...companyRows, ...driveRows];
  }, [debouncedQ, students.data, companies.data, drives.data]);

  function goToResult(href: string) {
    router.push(href);
    closeSearch();
  }

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

      <div ref={searchRef} className="relative ml-16 w-full max-w-[380px] shrink-0">
        <svg viewBox="0 0 24 24" fill="none" stroke="#8b95a6" strokeWidth={1.8} strokeLinecap="round" style={{ width: 18, height: 18, position: "absolute", left: 16, top: 13 }}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
        <input
          ref={searchInputRef}
          value={gq}
          onChange={(e) => setGq(e.target.value)}
          placeholder="Search students, companies, drives"
          style={{
            width: "100%",
            height: 44,
            border: "1px solid #e6eaf1",
            background: "#f7f9fc",
            borderRadius: 12,
            padding: "0 78px 0 44px",
            fontSize: 13.5,
            outline: "none",
          }}
          className="focus:border-[#1f4fd8] focus:bg-white"
        />
        <span
          style={{
            position: "absolute",
            right: 12,
            top: 11,
            fontFamily: "var(--font-ibm-plex-mono)",
            fontSize: 11,
            color: "#8b95a6",
            background: "#eef2f8",
            borderRadius: 6,
            padding: "4px 8px",
          }}
        >
          Ctrl K
        </span>

        {debouncedQ.length >= 2 && (
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 0,
              right: 0,
              background: "#fff",
              border: "1px solid #dfe4ec",
              borderRadius: 10,
              boxShadow: "0 20px 44px rgba(16,24,40,.14)",
              padding: 5,
              maxHeight: 320,
              overflow: "auto",
              zIndex: 70,
            }}
          >
            {results.length === 0 && (
              <p style={{ fontSize: 12.5, color: "#8b95a6", padding: "9px 11px" }}>No results for &quot;{debouncedQ}&quot;.</p>
            )}
            {results.map((r) => (
              <div
                key={r.key}
                onClick={() => goToResult(r.href)}
                style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 11px", borderRadius: 7, cursor: "pointer" }}
                className="hover:bg-[#f3f6fb]"
              >
                <span
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    fontSize: 9.5,
                    fontWeight: 500,
                    color: "#1f4fd8",
                    background: "#eaf0fe",
                    borderRadius: 4,
                    padding: "3px 6px",
                    letterSpacing: ".6px",
                  }}
                >
                  {r.kind}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 550 }}>{r.title}</span>
                <span style={{ fontSize: 11.5, color: "#8b95a6", marginLeft: "auto" }} className="truncate">
                  {r.meta}
                </span>
              </div>
            ))}
          </div>
        )}
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
          <div className="absolute right-0 top-[calc(100%+6px)] w-44 overflow-hidden rounded-[10px] border border-[#dfe4ec] bg-white py-1 shadow-[0_20px_44px_rgba(16,24,40,.14)]">
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

      <select
        value={year}
        onChange={() => {}}
        style={{
          flex: "0 1 auto",
          minWidth: 0,
          height: 44,
          border: "1px solid #e6eaf1",
          borderRadius: 12,
          background: "#fff",
          fontSize: 14,
          padding: "0 12px",
          color: "#16224a",
          fontWeight: 550,
        }}
      >
        <option>{year}</option>
      </select>

      <span
        style={{ flex: "0 1 auto", minWidth: 0, whiteSpace: "nowrap", height: 44, borderRadius: 12, background: "#1a3fa8", color: "#fff", fontSize: 14, fontWeight: 650, padding: "0 16px" }}
        className="flex items-center"
      >
        {semester}
      </span>

      <button
        type="button"
        title="Create drive"
        onClick={() => router.push("/placement/drives/new")}
        style={ICON_BTN_STYLE}
        className="flex flex-none items-center justify-center text-[20px] text-[#16224a] hover:bg-[#f3f6fb]"
      >
        +
      </button>

      <button
        type="button"
        title="Notifications"
        onClick={() => router.push("/placement/notifications")}
        style={{ ...ICON_BTN_STYLE, position: "relative" }}
        className="flex flex-none items-center justify-center hover:bg-[#f3f6fb]"
      >
        <BellIcon style={{ width: 19, height: 19, color: "#46536a" }} />
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: "50%", background: "#1f4fd8", border: "1.5px solid #fff" }} />
        )}
      </button>

      <button type="button" title="Settings — coming soon" style={ICON_BTN_STYLE} className="flex flex-none items-center justify-center hover:bg-[#f3f6fb]">
        <CogIcon style={{ width: 19, height: 19, color: "#46536a" }} />
      </button>

      <ConfirmDialog
        open={confirmingLogout}
        title="Sign out?"
        message="You'll need to log in again to access the Placement Cell portal."
        confirmLabel="Sign out"
        tone="danger"
        onConfirm={onLogout}
        onClose={() => setConfirmingLogout(false)}
      />
    </header>
  );
}

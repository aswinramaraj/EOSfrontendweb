"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { tokenStorage } from "@/shared/lib/token-storage";
import type { DashboardProfile, SectionStatus } from "../types/dashboard.types";
import { ErrorCard } from "./ErrorCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { LogoutIcon } from "./icons";

interface FacultyProfileDropdownProps {
  status: SectionStatus;
  profile: DashboardProfile | null;
  error: string | null;
  onRetry: () => void;
}

/** No Employee ID field: confirmed absent everywhere in this backend (neither
 * `faculty` nor `users` has one) — omitted rather than fabricated. */
export function FacultyProfileDropdown({ status, profile, error, onRetry }: FacultyProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  function handleLogout() {
    tokenStorage.clear();
    router.replace("/login");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-100 transition hover:ring-2 hover:ring-indigo-300"
      >
        {profile?.initials ?? "—"}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-72 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl"
        >
          {status === "loading" && (
            <div className="p-4">
              <LoadingSkeleton rows={3} />
            </div>
          )}

          {status === "error" && (
            <div className="p-4">
              <ErrorCard message={error} onRetry={onRetry} />
            </div>
          )}

          {profile && (
            <>
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-base font-bold text-indigo-700 ring-1 ring-indigo-100">
                  {profile.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{profile.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{profile.designation}</p>
                  <p className="truncate text-xs text-slate-400">
                    {profile.departmentCode} · {profile.departmentName}
                  </p>
                </div>
              </div>

              <div className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setIsExpanded((expanded) => !expanded)}
                  className="w-full rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  {isExpanded ? "Hide Full Profile" : "View Full Profile"}
                </button>

                {isExpanded && (
                  <dl className="mt-3 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Email</dt>
                      <dd className="truncate text-right text-slate-700">{profile.email}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Phone</dt>
                      <dd className="text-slate-700">{profile.phone ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Academic Year</dt>
                      <dd className="text-slate-700">{profile.academicYear ?? "—"}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Semester</dt>
                      <dd className="text-slate-700">{profile.semester ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="mb-1 text-slate-400">Subjects Handling</dt>
                      <dd>
                        {profile.subjectsHandling.length === 0 ? (
                          <span className="text-slate-400">None</span>
                        ) : (
                          <ul className="flex flex-col gap-1">
                            {profile.subjectsHandling.map((entry, index) => (
                              <li key={index} className="rounded-md bg-slate-50 px-2 py-1 text-slate-700">
                                {entry.subjectName}{" "}
                                <span className="text-slate-400">
                                  ({entry.departmentCode} - {entry.section})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </>
          )}

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
            >
              <LogoutIcon className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import { PencilIcon, XIcon } from "@/shared/components/icons";
import { useFacultyById } from "../hooks/useFacultyById";
import { useFacultyMappings } from "../hooks/useFacultyMappings";
import { useFacultyAttendance } from "../hooks/useFacultyAttendance";
import { useFacultyDocuments } from "../hooks/useFacultyDocuments";
import { useFacultyActivity } from "../hooks/useFacultyActivity";
import { FacultyAvatar } from "./FacultyAvatar";
import { formatDate, fullName } from "../lib/faculty-format";
import { EMPLOYMENT_STATUS_FROM_ENUM } from "../lib/faculty-wizard-config";
import type { Faculty } from "../types";

interface FacultyQuickViewDrawerProps {
  facultyId: number | null;
  onClose: () => void;
  onEdit: (faculty: Faculty) => void;
}

export function FacultyQuickViewDrawer({ facultyId, onClose, onEdit }: FacultyQuickViewDrawerProps) {
  const { show } = useToast();
  const { data: faculty, isLoading, error } = useFacultyById(facultyId);
  const { data: mappings } = useFacultyMappings({ faculty_id: facultyId ?? undefined, limit: 1 });
  const { data: attendance } = useFacultyAttendance(facultyId);
  const { data: documents } = useFacultyDocuments(facultyId);
  const { data: activity } = useFacultyActivity(facultyId);

  if (facultyId === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <aside className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {faculty ? `FAC${String(faculty.id).padStart(4, "0")}` : "—"}
            </p>
            <h3 className="text-base font-bold text-slate-900">
              {faculty ? fullName(faculty) : "Loading…"}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {faculty && (
              <Link
                href={`/admin/faculty/${faculty.id}`}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Full profile
              </Link>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 py-5">
          {isLoading && <p className="text-sm text-slate-500">Loading faculty…</p>}
          {error && (
            <p className="text-sm text-red-600">
              {error instanceof ApiError ? error.message : "Failed to load this faculty record."}
            </p>
          )}

          {faculty && (
            <>
              <div className="flex items-center gap-4">
                <FacultyAvatar faculty={faculty} className="h-16 w-16 rounded-xl text-xl" />
                <div>
                  <StatusPill tone={faculty.status === "active" ? "green" : "slate"}>
                    {faculty.status === "active" ? "Active" : "Inactive"}
                  </StatusPill>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {faculty.department?.name ?? "No department"}
                  </p>
                  <p className="text-xs text-slate-500">{faculty.designation} · Faculty</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {attendance ? `${attendance.overall.attendance_percentage}%` : "—"}
                  </p>
                  <p className="text-[11px] text-slate-500">Attendance</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{mappings?.meta.total ?? "—"}</p>
                  <p className="text-[11px] text-slate-500">Assignments</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{documents?.length ?? "—"}</p>
                  <p className="text-[11px] text-slate-500">Documents</p>
                </div>
              </div>

              <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
                {[
                  ["Designation", faculty.designation],
                  ["Department", faculty.department?.name ?? "—"],
                  ["Role", "Faculty"],
                  ["Date of joining", formatDate(faculty.date_of_joining)],
                  [
                    "Employment status",
                    (faculty.employment_status && EMPLOYMENT_STATUS_FROM_ENUM[faculty.employment_status]) || "—",
                  ],
                  ["Reporting to", "—"],
                  ["Phone", faculty.phone ?? "Not provided"],
                  ["Email", faculty.email],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2.5 text-sm">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recent activity
                </p>
                {(!activity || activity.length === 0) && (
                  <p className="mt-2 text-sm text-slate-500">No recorded activity yet.</p>
                )}
                {activity && activity.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {activity.slice(0, 3).map((entry) => (
                      <li key={entry.id} className="text-sm">
                        <p className="text-slate-800">{entry.description}</p>
                        <p className="text-xs text-slate-500">{formatDate(entry.created_at)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {faculty && (
          <div className="flex gap-2 border-t border-slate-200 px-5 py-4">
            <Link
              href={`/admin/faculty/${faculty.id}`}
              className="flex flex-1 items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Open full profile
            </Link>
            <button
              onClick={() => show("Notifications are coming soon.", "info")}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              aria-label="Notify"
            >
              Notify
            </button>
            <button
              onClick={() => onEdit(faculty)}
              className="rounded-md border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
              aria-label="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

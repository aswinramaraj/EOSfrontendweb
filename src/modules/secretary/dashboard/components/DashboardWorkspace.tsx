"use client";

import type { ComponentType, SVGProps } from "react";
import {
  BarChartIcon,
  CalendarXIcon,
  LogInIcon,
  SecretaryBriefcaseIcon,
  SecretaryCalendarIcon,
  SecretaryInboxIcon,
  UserXIcon,
} from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useSecretaryDashboardSummary } from "../hooks/useDashboardSummary";
import type { FacultyStatusEntry, SecretaryDashboardSummary } from "../types";

type FacultyRow = FacultyStatusEntry & { status: "On leave" | "On duty" };

interface Tile {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  value: string | number;
  label: string;
  note: string;
}

function buildTiles(data: SecretaryDashboardSummary): Tile[] {
  return [
    { icon: UserXIcon, value: data.students_today.absent, label: "Students absent", note: "Marked absent across today's classes" },
    { icon: SecretaryBriefcaseIcon, value: data.students_today.on_duty, label: "Students on duty", note: "Marked on-duty today" },
    { icon: CalendarXIcon, value: data.faculty_today.on_leave, label: "Faculty on leave", note: "On leave today" },
    { icon: LogInIcon, value: data.faculty_today.on_duty, label: "Faculty on duty", note: "On duty today" },
    {
      icon: BarChartIcon,
      value: data.attendance_today.completion_percentage === null ? "—" : `${data.attendance_today.completion_percentage}%`,
      label: "Attendance marked",
      note: `${data.attendance_today.marked_sessions} of ${data.attendance_today.scheduled_sessions} sessions logged today`,
    },
    {
      icon: SecretaryInboxIcon,
      value: data.pending_requests.total,
      label: "Requests to decide",
      note: "Proposals, venue and media",
    },
  ];
}

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function DashboardWorkspace() {
  const { data, isLoading, error } = useSecretaryDashboardSummary();

  const facultyRows: FacultyRow[] = data
    ? [
        ...data.faculty_today.on_leave_list.map((f) => ({ ...f, status: "On leave" as const })),
        ...data.faculty_today.on_duty_list.map((f) => ({ ...f, status: "On duty" as const })),
      ]
    : [];

  return (
    <div>
      <div className="mb-[22px]">
        <div className="text-[28px] font-semibold tracking-[-0.02em] text-slate-900">Dashboard</div>
        <div className="text-[14.5px] text-slate-600">
          {data ? `Today's attendance — ${formatDateLabel(data.date)}` : "Overview of secretary activities"}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load the dashboard."}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[18px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[142px] animate-pulse rounded-[14px] border border-[#E3E8EF] bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-[18px]">
            {buildTiles(data).map((tile) => (
              <div
                key={tile.label}
                className="rounded-[14px] border border-[#E3E8EF] bg-white p-[22px]"
              >
                <div className="mb-[14px] flex items-center gap-[14px]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600">
                    <tile.icon className="h-5 w-5 text-white" />
                  </span>
                  <span className="text-[36px] font-bold leading-none tracking-[-0.02em] text-slate-900">
                    {tile.value}
                  </span>
                </div>
                <div className="mb-[5px] text-[15.5px] font-medium text-slate-900">{tile.label}</div>
                <div className="text-[13.5px] text-slate-400">{tile.note}</div>
              </div>
            ))}
          </div>

          <div className="mt-[22px] rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
              <SecretaryCalendarIcon className="h-[17px] w-[17px] text-blue-600" />
              <div className="text-[15.5px] font-semibold text-slate-900">Faculty on Leave / On Duty</div>
              <span className="text-[12.5px] text-slate-400">{formatDateLabel(data.date)}</span>
            </div>
            <div className="overflow-x-auto px-5 pb-[18px]">
              <div className="grid min-w-[640px] grid-cols-[minmax(160px,1fr)_130px_140px_minmax(140px,1fr)] gap-3 border-b border-slate-100 pb-2 pt-3.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                <span>Name</span>
                <span>Department</span>
                <span>Designation</span>
                <span>Status</span>
              </div>
              {facultyRows.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No faculty on leave or on duty today.
                </div>
              )}
              {facultyRows.map((row) => (
                <div
                  key={`${row.id}-${row.status}`}
                  className="grid min-w-[640px] grid-cols-[minmax(160px,1fr)_130px_140px_minmax(140px,1fr)] items-center gap-3 border-b border-slate-100 py-[13px] text-[14.5px]"
                >
                  <span className="font-medium text-slate-900">{row.name}</span>
                  <span className="text-slate-600">{row.department}</span>
                  <span className="text-slate-600">{row.designation}</span>
                  <span className="font-semibold text-blue-700">{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

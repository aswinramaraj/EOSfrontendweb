"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { AlertTriangleIcon, CheckIcon, ClockIcon, DownloadIcon, PeopleIcon } from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { FacultyStatCard } from "@/modules/faculty/components/FacultyStatCard";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { exportAttendanceSummaryPdf } from "@/modules/faculty/lib/faculty-report-pdfs";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_ACADEMIC_YEAR = `${CURRENT_YEAR}-${String((CURRENT_YEAR + 1) % 100).padStart(2, "0")}`;
const ACADEMIC_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const startYear = CURRENT_YEAR - i;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
});

function percentageTone(value: number): PillTone {
  if (value >= 85) return "green";
  if (value >= 70) return "amber";
  return "red";
}

export default function FacultyAttendancePage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [academicYear, setAcademicYear] = useState(DEFAULT_ACADEMIC_YEAR);

  const { data: departments } = useDepartments();
  const { data, isLoading, error } = useFacultyAttendanceOverview({
    department_id: departmentId,
    academic_year: academicYear,
    search: debouncedQuery || undefined,
  });

  const rows = useMemo(() => data?.rows ?? [], [data]);

  return (
    <div>
      <nav className="mb-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link href="/admin/faculty" className="hover:text-slate-700">
          Faculty
        </Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-slate-700">Attendance</span>
      </nav>

      <PageHeader
        title="Faculty Attendance"
        description="View-only — sourced from each faculty's daily attendance record. Editing isn't available here."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              exportAttendanceSummaryPdf(rows, {
                academicYear,
                department: departmentId ? departments?.find((d) => d.id === departmentId)?.code : undefined,
              })
            }
          >
            <DownloadIcon className="h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FacultyStatCard label="Full Day — Today" value={data?.today.full_days ?? 0} icon={CheckIcon} tone="green" />
        <FacultyStatCard label="Half Day — Today" value={data?.today.half_days ?? 0} icon={ClockIcon} tone="amber" />
        <FacultyStatCard label="Absent — Today" value={data?.today.absent ?? 0} icon={AlertTriangleIcon} tone="red" />
        <FacultyStatCard
          label="On Duty / Leave — Today"
          value={(data?.today.on_duty ?? 0) + (data?.today.on_vacation ?? 0) + (data?.today.on_leave ?? 0)}
          icon={PeopleIcon}
          tone="blue"
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput placeholder="Search faculty…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="w-48">
          <SelectInput
            value={departmentId ?? ""}
            onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectInput>
        </div>
        <div className="w-36">
          <SelectInput value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            {ACADEMIC_YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                AY {y}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading && <p className="p-6 text-sm text-slate-500">Loading…</p>}
        {error && (
          <p className="p-6 text-sm text-red-600">
            {error instanceof ApiError ? error.message : "Couldn't load attendance."}
          </p>
        )}
        {!isLoading && !error && rows.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No faculty match these filters.</p>
        )}
        {!isLoading && !error && rows.length > 0 && (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Faculty
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Department
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Full days
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Half days
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Absent
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  On duty / leave
                </th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Attendance %
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.faculty_id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FacultyAvatar
                        faculty={{
                          id: row.faculty_id,
                          first_name: row.first_name,
                          last_name: row.last_name,
                          profile_url: row.profile_url,
                        }}
                        className="h-8 w-8 shrink-0 rounded-full text-xs"
                      />
                      <span className="font-medium text-slate-900">
                        {row.first_name} {row.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.department?.code ?? row.department?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{row.full_days}</td>
                  <td className="px-4 py-3 text-slate-700">{row.half_days}</td>
                  <td className="px-4 py-3 text-slate-700">{row.absent}</td>
                  <td className="px-4 py-3 text-slate-700">{row.on_duty + row.on_vacation + row.on_leave}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={percentageTone(row.attendance_percentage)}>
                      {row.attendance_percentage}%
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/faculty/${row.faculty_id}?section=attendance`}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View Full Attendance
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

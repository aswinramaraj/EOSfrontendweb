"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable } from "@/shared/components/ui/DataTable";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ClockIcon, DownloadIcon } from "@/shared/components/icons";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { DepartmentDrilldownCard } from "@/modules/hr/components/DepartmentDrilldownCard";
import { PercentStatTile } from "@/modules/hr/components/PercentStatTile";
import { BulkMarkAttendanceModal } from "@/modules/hr/components/BulkMarkAttendanceModal";
import type { FacultyAttendanceOverviewRow } from "@/modules/faculty/types";

const ALL = "all";

function attendanceTone(percent: number): PillTone {
  if (percent >= 86) return "green";
  if (percent >= 70) return "amber";
  return "red";
}

// What this list needs to show at a glance: did they show up today, are
// they out on an approved leave/OD, are they absent with nothing explaining
// it, or has nobody checked at all yet.
type TodayStatusLabel = "Present" | "On Leave" | "On Duty" | "On Vacation" | "Absent" | "Not Marked";

function todayStatusLabel(status: string | null | undefined): TodayStatusLabel {
  if (!status) return "Not Marked";
  if (status === "absent") return "Absent";
  if (status === "on_leave") return "On Leave";
  if (status === "on_duty") return "On Duty";
  if (status === "on_vacation") return "On Vacation";
  return "Present";
}

function todayStatusTone(label: TodayStatusLabel): PillTone {
  if (label === "Present") return "green";
  if (label === "Absent") return "red";
  if (label === "On Leave") return "amber";
  if (label === "On Duty" || label === "On Vacation") return "blue";
  return "slate";
}

export default function HRFacultyAttendancePage() {
  const { show } = useToast();
  const [view, setView] = useState<"department" | "all">("department");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(ALL);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMarkOpen, setBulkMarkOpen] = useState(false);

  const { data: departments } = useDepartments();
  const { data, isLoading, error } = useFacultyAttendanceOverview({});

  const departmentSummaries = useMemo(() => {
    const rows = data?.rows ?? [];
    return (departments ?? []).map((dept) => {
      const deptRows = rows.filter((r) => r.department?.id === dept.id);
      const avgAttendance = deptRows.length
        ? Math.round(deptRows.reduce((sum, r) => sum + r.attendance_percentage, 0) / deptRows.length)
        : 0;
      const needsAttention = deptRows.filter((r) => r.attendance_percentage < 70).length;
      return { department: dept, totalFaculty: deptRows.length, avgAttendance, needsAttention };
    });
  }, [departments, data]);

  const allFacultyRows = useMemo(() => {
    let rows = data?.rows ?? [];
    if (departmentFilter !== ALL) rows = rows.filter((r) => String(r.department?.id) === departmentFilter);
    const query = search.trim().toLowerCase();
    if (query) rows = rows.filter((r) => fullName(r).toLowerCase().includes(query));
    return rows;
  }, [data, departmentFilter, search]);

  const allRowsSelected = allFacultyRows.length > 0 && allFacultyRows.every((r) => selectedIds.has(r.faculty_id));

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const ids = allFacultyRows.map((r) => r.faculty_id);
      const selected = ids.length > 0 && ids.every((id) => prev.has(id));
      return selected ? new Set() : new Set(ids);
    });
  }

  const selectedFaculty = useMemo(
    () =>
      (data?.rows ?? [])
        .filter((r) => selectedIds.has(r.faculty_id))
        .map((r) => ({ id: r.faculty_id, name: fullName(r), hasExistingToday: r.today_status != null })),
    [data, selectedIds],
  );

  return (
    <div>
      <PageHeader
        title="Faculty Attendance"
        description="Auto-captured from biometric punch logs where available, with manual correction — one punch counts as a half day, two as a full day."
        actions={
          <button
            onClick={() => show("Export is coming soon.", "info")}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <DownloadIcon className="h-4 w-4" />
            Export
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load attendance."}
        </p>
      )}

      {data && (
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(() => {
            const { full_days, half_days, absent, on_leave, on_duty, on_vacation, attendance_percentage } = data.today;
            const total = full_days + half_days + absent + on_leave + on_duty + on_vacation;
            const pct = (count: number) => (total ? (count / total) * 100 : 0);
            return (
              <>
                <PercentStatTile
                  label="Attendance % — Today"
                  percent={attendance_percentage}
                  subtitle={`${full_days + half_days} of ${total} faculty present`}
                />
                <PercentStatTile
                  label="Full Day — Today"
                  percent={pct(full_days)}
                  subtitle={`${full_days} of ${total} faculty`}
                />
                <PercentStatTile
                  label="Half Day — Today"
                  percent={pct(half_days)}
                  subtitle={`${half_days} of ${total} faculty`}
                />
                <PercentStatTile
                  label="Absent — Today"
                  percent={pct(absent)}
                  subtitle={`${absent} of ${total} faculty`}
                />
                <PercentStatTile
                  label="On Leave — Today"
                  percent={pct(on_leave)}
                  subtitle={`${on_leave} of ${total} faculty — counts against %`}
                />
                <PercentStatTile
                  label="On Duty — Today"
                  percent={pct(on_duty)}
                  subtitle={`${on_duty} of ${total} faculty — excused`}
                />
                <PercentStatTile
                  label="On Vacation — Today"
                  percent={pct(on_vacation)}
                  subtitle={`${on_vacation} of ${total} faculty — excused`}
                />
              </>
            );
          })()}
        </div>
      )}

      <div className="mb-5 inline-flex rounded-md border border-slate-200 bg-white p-1">
        <button
          onClick={() => setView("department")}
          className={`rounded-[4px] px-3 py-1.5 text-sm font-medium ${
            view === "department" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          By Department
        </button>
        <button
          onClick={() => setView("all")}
          className={`rounded-[4px] px-3 py-1.5 text-sm font-medium ${
            view === "all" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          All Faculty
        </button>
      </div>

      {view === "department" && (
        <>
          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
              ))}
            </div>
          )}

          {!isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {departmentSummaries.map(({ department, totalFaculty, avgAttendance, needsAttention }) => (
                <DepartmentDrilldownCard
                  key={department.id}
                  icon={ClockIcon}
                  name={department.name}
                  code={department.code}
                  badge={<StatusPill tone={attendanceTone(avgAttendance)}>{avgAttendance}% avg</StatusPill>}
                  metrics={[
                    { label: "Total Faculty", value: totalFaculty },
                    { label: "Needs Attention", value: needsAttention, highlight: needsAttention > 0 },
                  ]}
                  href={`/hr/faculty-attendance/department/${department.id}`}
                  linkLabel="View Attendance"
                />
              ))}

              {departmentSummaries.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-slate-500">No departments found.</p>
              )}
            </div>
          )}
        </>
      )}

      {view === "all" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <SearchInput placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <SelectInput className="sm:w-56" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value={ALL}>All Departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </SelectInput>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-sm font-medium text-blue-900">{selectedIds.size} faculty selected</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  Clear selection
                </button>
                <button
                  onClick={() => setBulkMarkOpen(true)}
                  className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          )}

          <DataTable<FacultyAttendanceOverviewRow>
            isLoading={isLoading}
            columns={[
              {
                key: "select",
                header: (
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all faculty"
                  />
                ),
                render: (row) => (
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.faculty_id)}
                    onChange={() => toggleOne(row.faculty_id)}
                    aria-label={`Select ${fullName(row)}`}
                  />
                ),
              },
              {
                key: "faculty",
                header: "Faculty",
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <FacultyAvatar
                      faculty={{ id: row.faculty_id, first_name: row.first_name, last_name: row.last_name, profile_url: row.profile_url }}
                      className="h-8 w-8 rounded-full text-xs"
                    />
                    <span className="font-medium text-slate-900">{fullName(row)}</span>
                  </div>
                ),
              },
              { key: "department", header: "Department", render: (row) => row.department?.name ?? "—" },
              {
                key: "today_status",
                header: "Status",
                render: (row) => {
                  const label = todayStatusLabel(row.today_status);
                  return <StatusPill tone={todayStatusTone(label)}>{label}</StatusPill>;
                },
              },
              {
                key: "attendance_percentage",
                header: "Attendance % (year)",
                render: (row) => (
                  <StatusPill tone={attendanceTone(row.attendance_percentage)}>{row.attendance_percentage}%</StatusPill>
                ),
              },
              {
                key: "actions",
                header: "",
                align: "right",
                render: (row) => (
                  <Link
                    href={`/hr/faculty-attendance/${row.faculty_id}`}
                    className="text-sm font-medium text-blue-700 hover:text-blue-800"
                  >
                    View
                  </Link>
                ),
              },
            ]}
            rows={allFacultyRows}
            rowKey={(row) => row.faculty_id}
            emptyMessage="No faculty match these filters."
          />
        </div>
      )}

      <BulkMarkAttendanceModal
        open={bulkMarkOpen}
        faculty={selectedFaculty}
        onClose={() => setBulkMarkOpen(false)}
        onDone={() => setSelectedIds(new Set())}
      />
    </div>
  );
}

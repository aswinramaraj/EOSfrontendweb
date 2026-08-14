"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DataTable } from "@/shared/components/ui/DataTable";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { AlertTriangleIcon, BriefcaseIcon, CalendarIcon, DownloadIcon, UserCheckIcon } from "@/shared/components/icons";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { exportAttendanceSummaryPdf } from "@/modules/faculty/lib/faculty-report-pdfs";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { BulkMarkAttendanceModal } from "@/modules/hr/components/BulkMarkAttendanceModal";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRStatGridSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import type { FacultyAttendanceOverviewRow } from "@/modules/faculty/types";

const ALL = "all";

function attendanceTone(percent: number): PillTone {
  if (percent >= 86) return "green";
  if (percent >= 70) return "amber";
  return "red";
}

type TodayStatusLabel = "Present" | "On Leave" | "On Duty" | "On Vacation" | "Absent" | "Not Marked";
type StatusTab = "all" | "present" | "leave" | "duty" | "absent";

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
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState(ALL);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkMarkOpen, setBulkMarkOpen] = useState(false);
  const [exportPending, setExportPending] = useState(false);

  const { data: departments } = useDepartments();
  const { data, isLoading, error } = useFacultyAttendanceOverview({});

  const baseFacultyRows = useMemo(() => {
    let rows = data?.rows ?? [];
    if (departmentFilter !== ALL) rows = rows.filter((r) => String(r.department?.id) === departmentFilter);
    const query = search.trim().toLowerCase();
    if (query) rows = rows.filter((r) => fullName(r).toLowerCase().includes(query));
    return rows;
  }, [data, departmentFilter, search]);

  const statusTabCounts = useMemo(() => {
    const present = baseFacultyRows.filter((r) => todayStatusLabel(r.today_status) === "Present").length;
    const leave = baseFacultyRows.filter((r) => todayStatusLabel(r.today_status) === "On Leave").length;
    const duty = baseFacultyRows.filter((r) => {
      const label = todayStatusLabel(r.today_status);
      return label === "On Duty" || label === "On Vacation";
    }).length;
    const absent = baseFacultyRows.filter((r) => todayStatusLabel(r.today_status) === "Absent").length;
    return { present, leave, duty, absent };
  }, [baseFacultyRows]);

  const allFacultyRows = useMemo(() => {
    if (statusTab === "all") return baseFacultyRows;
    return baseFacultyRows.filter((r) => {
      const label = todayStatusLabel(r.today_status);
      if (statusTab === "present") return label === "Present";
      if (statusTab === "leave") return label === "On Leave";
      if (statusTab === "duty") return label === "On Duty" || label === "On Vacation";
      if (statusTab === "absent") return label === "Absent";
      return true;
    });
  }, [baseFacultyRows, statusTab]);

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

  function resetFilters() {
    setSearch("");
    setDepartmentFilter(ALL);
    setStatusTab("all");
  }

  async function handleExportRegister() {
    if (allFacultyRows.length === 0) {
      show("No attendance data to export for these filters.", "info");
      return;
    }
    setExportPending(true);
    try {
      const departmentLabel = departmentFilter !== ALL ? departments?.find((d) => String(d.id) === departmentFilter)?.name : undefined;
      await exportAttendanceSummaryPdf(allFacultyRows, { academicYear: "Current", department: departmentLabel });
      show("Attendance register exported.", "success");
    } catch {
      show("Couldn't generate the register.", "error");
    } finally {
      setExportPending(false);
    }
  }

  return (
    <div>
      <HRPageHeader
        title="Attendance & leave"
        description={`Biometric register, leave balances and OD movement${data ? "" : "."}`}
        actions={
          <>
            <Button variant="secondary" isPending={exportPending} onClick={handleExportRegister}>
              <DownloadIcon className="h-4 w-4" />
              Download register
            </Button>
            <Button variant="primary" disabled={selectedIds.size === 0} onClick={() => setBulkMarkOpen(true)}>
              Mark manual entry
            </Button>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load attendance."}
        </p>
      )}

      {!data && isLoading && (
        <div className="mb-5">
          <HRStatGridSkeleton count={4} />
        </div>
      )}

      {data && (
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HRStatCard
            icon={UserCheckIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="Present"
            value={data.today.full_days + data.today.half_days}
            caption={`${data.today.attendance_percentage}% of roll`}
          />
          <HRStatCard
            icon={CalendarIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="On leave"
            value={data.today.on_leave}
          />
          <HRStatCard
            icon={BriefcaseIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="On official duty"
            value={data.today.on_duty + data.today.on_vacation}
          />
          <HRStatCard
            icon={AlertTriangleIcon}
            iconClassName="bg-[#EEF2FF] text-[#2655DA]"
            label="Unapproved absence"
            value={data.today.absent}
          />
        </div>
      )}

      <div className="flex flex-col gap-4">
        <HRSegmentedTabs
          value={statusTab}
          onChange={setStatusTab}
          options={[
            { value: "all", label: "All", count: baseFacultyRows.length },
            { value: "present", label: "Present", count: statusTabCounts.present },
            { value: "leave", label: "On leave", count: statusTabCounts.leave },
            { value: "duty", label: "On duty", count: statusTabCounts.duty },
            { value: "absent", label: "Absent", count: statusTabCounts.absent },
          ]}
        />

        <HRFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name or employee ID…"
          onReset={resetFilters}
          resultCount={{ showing: allFacultyRows.length, total: baseFacultyRows.length, noun: "records" }}
          filters={
            <SelectInput className="w-auto" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value={ALL}>All departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </SelectInput>
          }
        />

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-900">{selectedIds.size} faculty selected</p>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm font-medium text-blue-700 hover:text-blue-800"
            >
              Clear selection
            </button>
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

        <p className="text-xs text-slate-400">Register auto-locks at 6:00 pm · manual corrections need HR head approval.</p>
      </div>

      <BulkMarkAttendanceModal
        open={bulkMarkOpen}
        faculty={selectedFaculty}
        onClose={() => setBulkMarkOpen(false)}
        onDone={() => setSelectedIds(new Set())}
      />
    </div>
  );
}

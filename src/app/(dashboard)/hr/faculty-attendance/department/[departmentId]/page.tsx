"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { DataTable } from "@/shared/components/ui/DataTable";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { PercentStatTile } from "@/modules/hr/components/PercentStatTile";
import { HRStatGridSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import type { FacultyAttendanceOverviewRow } from "@/modules/faculty/types";

function attendanceTone(percent: number): PillTone {
  if (percent >= 86) return "green";
  if (percent >= 70) return "amber";
  return "red";
}

export default function HRFacultyAttendanceDepartmentPage() {
  const { departmentId } = useParams<{ departmentId: string }>();
  const id = Number(departmentId);
  const [search, setSearch] = useState("");

  const { data: departments } = useDepartments();
  const department = departments?.find((d) => d.id === id);

  const { data, isLoading, error } = useFacultyAttendanceOverview({
    department_id: id,
    search: search || undefined,
  });

  const rows = data?.rows ?? [];

  return (
    <div>
      <HRPageHeader
        title={department ? department.name : "Department"}
        description={department ? `Attendance for faculty in ${department.name}.` : undefined}
        actions={
          <Link href="/hr/faculty-attendance">
            <Button variant="secondary">
              <ChevronLeftIcon className="h-4 w-4" />
              All Departments
            </Button>
          </Link>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load attendance."}
        </p>
      )}

      {!data && isLoading && (
        <div className="mb-5">
          <HRStatGridSkeleton count={7} />
        </div>
      )}

      {data && (
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
        <SearchInput placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable<FacultyAttendanceOverviewRow>
        isLoading={isLoading}
        columns={[
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
          { key: "full_days", header: "Full Days" },
          { key: "half_days", header: "Half Days" },
          { key: "absent", header: "Absent" },
          { key: "on_leave", header: "On Leave" },
          { key: "on_duty", header: "On Duty" },
          { key: "on_vacation", header: "On Vacation" },
          {
            key: "total_days",
            header: "Total Days",
            render: (row) => row.full_days + row.half_days + row.absent + row.on_leave + row.on_duty + row.on_vacation,
          },
          {
            key: "attendance_percentage",
            header: "Attendance %",
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
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Full Attendance
              </Link>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.faculty_id}
        emptyMessage="No faculty match these filters."
      />
    </div>
  );
}

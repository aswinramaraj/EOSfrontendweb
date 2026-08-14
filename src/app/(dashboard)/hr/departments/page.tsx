"use client";

import { useMemo, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { CheckIcon, FolderIcon, PeopleIcon } from "@/shared/components/icons";
import { useHrDepartments } from "@/modules/hr/hooks/useHrDepartments";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { DepartmentDrilldownCard } from "@/modules/hr/components/DepartmentDrilldownCard";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRPageSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import type { DepartmentAppraisalRollupStatus } from "@/modules/hr/types/api";

type TabKey = "all" | DepartmentAppraisalRollupStatus;

export default function HRDepartmentsPage() {
  const { data: departments, isLoading, error } = useHrDepartments();
  const { data: attendanceOverview } = useFacultyAttendanceOverview({});
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabKey>("all");

  const filtered = useMemo(() => {
    const rows = departments ?? [];
    const bySearch = search
      ? rows.filter(
          (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase()),
        )
      : rows;
    if (tab === "all") return bySearch;
    return bySearch.filter((d) => d.appraisal_status === tab);
  }, [departments, search, tab]);

  const totalFaculty = departments?.reduce((sum, d) => sum + d.total_faculty, 0) ?? 0;
  const completeCount = departments?.filter((d) => d.appraisal_status === "complete").length ?? 0;
  const avgAttendance = attendanceOverview?.today.attendance_percentage ?? 0;
  const departmentsAbove85 = useMemo(() => {
    const rows = attendanceOverview?.rows ?? [];
    const byDept = new Map<number, { total: number; count: number }>();
    for (const r of rows) {
      if (!r.department) continue;
      const entry = byDept.get(r.department.id) ?? { total: 0, count: 0 };
      entry.total += r.attendance_percentage;
      entry.count += 1;
      byDept.set(r.department.id, entry);
    }
    let above = 0;
    for (const { total, count } of byDept.values()) {
      if (count && total / count >= 85) above += 1;
    }
    return above;
  }, [attendanceOverview]);

  return (
    <div>
      <HRPageHeader
        title="Departments"
        description="Faculty strength, cadre mix, attendance and appraisal progress by department."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load departments."}
        </p>
      )}

      {!error && departments && (
        <>
          <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <HRStatCard icon={FolderIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Departments" value={departments.length} />
            <HRStatCard icon={PeopleIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Total Faculty" value={totalFaculty} caption={`On roll across ${departments.length} departments`} />
            <HRStatCard
              icon={PeopleIcon}
              iconClassName="bg-[#EEF2FF] text-[#2655DA]"
              label="Avg. attendance"
              value={`${avgAttendance}%`}
              caption={`Above 85% in ${departmentsAbove85} departments`}
            />
            <HRStatCard
              icon={CheckIcon}
              iconClassName="bg-[#EEF2FF] text-[#2655DA]"
              label="Appraisal complete"
              value={`${completeCount} / ${departments.length}`}
            />
          </div>

          <div className="mb-5">
            <HRSegmentedTabs
              value={tab}
              onChange={setTab}
              options={[
                { value: "all", label: "All", count: departments.length },
                { value: "complete", label: "Completed", count: departments.filter((d) => d.appraisal_status === "complete").length },
                { value: "in_progress", label: "In progress", count: departments.filter((d) => d.appraisal_status === "in_progress").length },
                { value: "not_started", label: "Not started", count: departments.filter((d) => d.appraisal_status === "not_started").length },
              ]}
            />
          </div>

          <HRFilterBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search department or code…"
            onReset={() => {
              setSearch("");
              setTab("all");
            }}
            resultCount={{ showing: filtered.length, total: departments.length, noun: "records" }}
          />
        </>
      )}

      {isLoading && <HRPageSkeleton statCount={4} cardCount={3} cardContentClassName="h-40" blockCount={0} />}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dept) => {
            const leavePct = dept.total_faculty ? (dept.on_leave_today / dept.total_faculty) * 100 : 0;
            const odPct = dept.total_faculty ? (dept.on_od_today / dept.total_faculty) * 100 : 0;
            return (
              <DepartmentDrilldownCard
                key={dept.id}
                icon={PeopleIcon}
                name={dept.name}
                code={dept.code}
                metrics={[
                  { label: "Total Faculty", value: dept.total_faculty },
                  {
                    label: "On Leave Today",
                    value: `${leavePct.toFixed(1)}%`,
                    sublabel: `${dept.on_leave_today} of ${dept.total_faculty}`,
                  },
                  {
                    label: "On OD Today",
                    value: `${odPct.toFixed(1)}%`,
                    sublabel: `${dept.on_od_today} of ${dept.total_faculty}`,
                  },
                  { label: "Pending Requests", value: dept.pending_requests, highlight: dept.pending_requests > 0 },
                ]}
                href={`/hr/departments/${dept.id}`}
                linkLabel="View Department"
              />
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-500">No departments match these filters.</p>
          )}
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <p className="mt-5 text-xs text-slate-400">Cadre ratio target 1:2:4 (Professor : Associate : Assistant) as per AICTE norms.</p>
      )}
    </div>
  );
}

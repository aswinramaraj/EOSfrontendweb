"use client";

import { PageHeader } from "@/shared/components/ui/PageHeader";
import { ApiError } from "@/shared/lib/api-client";
import { PeopleIcon } from "@/shared/components/icons";
import { useHrDepartments } from "@/modules/hr/hooks/useHrDepartments";
import { DepartmentDrilldownCard } from "@/modules/hr/components/DepartmentDrilldownCard";

export default function HRDepartmentsPage() {
  const { data: departments, isLoading, error } = useHrDepartments();

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Monitor faculty strength, leave activity, and appraisal progress across departments."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load departments."}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments?.map((dept) => {
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
        </div>
      )}
    </div>
  );
}

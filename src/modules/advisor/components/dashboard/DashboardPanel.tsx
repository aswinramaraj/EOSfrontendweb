"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { AlertTriangleIcon, CheckIcon, PeopleIcon, ShieldCheckIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useAdvisorDashboard } from "../../hooks/useDashboard";
import { useClassResult } from "../../hooks/useStudents";
import { useLeaves } from "../../hooks/useLeaves";
import { useOds } from "../../hooks/useOds";
import { NoMenteeClasses } from "../NoMenteeClasses";

export function DashboardPanel() {
  const { data, isLoading, error } = useAdvisorDashboard();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const activeClassId = classId ?? data?.classes[0]?.class_id;

  // Reused, unmodified endpoints (already used elsewhere in the Advisor
  // portal) — the dashboard aggregation endpoint itself only ever returns
  // combined stats across every mentored class, so per-class numbers are
  // derived here from the selected class's real roster instead.
  const { data: classResult, isLoading: classResultLoading } = useClassResult(activeClassId);
  const { data: pendingLeaves } = useLeaves({ status: "pending", limit: 100 });
  const { data: pendingOds } = useOds({ status: "pending", limit: 100 });

  const stats = useMemo(() => {
    const students = classResult?.students ?? [];
    const studentIds = new Set(students.map((s) => s.id));
    return {
      totalStudents: students.length,
      lowAttendanceCount: students.filter((s) => s.attendance_percent !== null && s.attendance_percent < 75)
        .length,
      pendingLeaveCount: (pendingLeaves?.data ?? []).filter((l) => studentIds.has(l.student_id)).length,
      pendingOdCount: (pendingOds?.data ?? []).filter((o) => studentIds.has(o.creator.id)).length,
    };
  }, [classResult, pendingLeaves, pendingOds]);

  if (error) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof ApiError ? error.message : "Failed to load dashboard."}
      </p>
    );
  }

  if (isLoading || !data) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (data.classes.length === 0) {
    return (
      <div>
        <PageHeader title="Advisor dashboard" />
        <NoMenteeClasses />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Advisor dashboard" description="Overview of your mentored class." />

      <div className="mb-6 max-w-xs">
        <SelectInput value={activeClassId} onChange={(e) => setClassId(Number(e.target.value))}>
          {data.classes.map((c, index) => (
            <option key={`${c.class_id}-${c.academic_year ?? index}`} value={c.class_id}>
              {c.label}
            </option>
          ))}
        </SelectInput>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total students"
          value={classResultLoading ? "…" : stats.totalStudents}
          icon={PeopleIcon}
        />
        <StatCard
          label="Below 75% attendance"
          value={classResultLoading ? "…" : stats.lowAttendanceCount}
          icon={AlertTriangleIcon}
        />
        <Link href="/advisor/leave">
          <StatCard label="Pending leave requests" value={stats.pendingLeaveCount} icon={CheckIcon} />
        </Link>
        <Link href="/advisor/on-duty">
          <StatCard label="Pending on-duty requests" value={stats.pendingOdCount} icon={ShieldCheckIcon} />
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent announcements</h3>
          <Link href="/advisor/announcements" className="text-sm font-medium text-blue-700 hover:underline">
            Post announcement
          </Link>
        </div>
        {data.recent_announcements.length === 0 ? (
          <p className="text-sm text-slate-500">No announcements yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {data.recent_announcements.map((a) => (
              <li key={a.id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                <p className="mt-1 text-sm text-slate-600">{a.content}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Posted by {a.posted_by} · {new Date(a.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

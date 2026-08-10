"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { DataTable } from "@/shared/components/ui/DataTable";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { TextInput } from "@/shared/components/ui/TextInput";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import {
  AwardIcon,
  BarChartIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  PeopleIcon,
  RupeeIcon,
} from "@/shared/components/icons";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { PendingActionsDrawer } from "@/modules/hr/components/PendingActionsDrawer";
import { useHrDashboard } from "@/modules/hr/hooks/useHrDashboard";
import { useHrRequests } from "@/modules/hr/hooks/useHrRequests";
import { useAppraisalRequests } from "@/modules/hr/hooks/useAppraisalRequests";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import type { DepartmentAppraisalRollupStatus, HrDepartmentRollup } from "@/modules/hr/types/api";

const HR_ACTIONABLE_APPRAISAL_STATUSES = new Set(["hod_reviewed", "hr_scored"]);

const ALL_DEPARTMENTS = "all";

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// No "name" field exists on HR accounts (they aren't linked to a faculty
// record) — the only real identifier is the role, so the greeting addresses
// that ("HR Payroll") rather than fabricating a person's name.
function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const ACRONYM_WORDS = new Set(["hr"]);

function roleDisplayName(role: string): string {
  return role
    .split("_")
    .map((word) => (ACRONYM_WORDS.has(word) ? word.toUpperCase() : word[0]?.toUpperCase() + word.slice(1)))
    .join(" ");
}

function isDateInRange(dateIso: string, fromIso: string, toIso: string): boolean {
  return dateIso >= fromIso.slice(0, 10) && dateIso <= toIso.slice(0, 10);
}

function formatDisplayDate(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const APPRAISAL_STATUS_TONE: Record<DepartmentAppraisalRollupStatus, PillTone> = {
  not_started: "slate",
  in_progress: "amber",
  complete: "green",
};

const APPRAISAL_STATUS_LABEL: Record<DepartmentAppraisalRollupStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  complete: "Complete",
};

const QUICK_ACTIONS = [
  { label: "Review Leaves", icon: CalendarIcon, href: "/hr/requests?tab=leave" },
  { label: "Review OD", icon: BriefcaseIcon, href: "/hr/requests?tab=od" },
  { label: "Process Payroll", icon: RupeeIcon, href: "/hr/payroll" },
  { label: "Employee Reviews", icon: AwardIcon, href: "/hr/employee-reviews" },
  { label: "Faculty Directory", icon: PeopleIcon, href: "/hr/faculty-directory" },
  { label: "View Reports", icon: BarChartIcon, href: "/hr/reports" },
];

export default function HRDashboardPage() {
  const router = useRouter();
  const authUser = useAuthUser();
  const [pendingActionsOpen, setPendingActionsOpen] = useState(false);
  const [department, setDepartment] = useState<string>(ALL_DEPARTMENTS);
  const [statusDate, setStatusDate] = useState<string>(todayIso());
  const isToday = statusDate === todayIso();

  const { data, isLoading, error } = useHrDashboard();
  // Fetched broadly and filtered client-side to just the HOD-approved,
  // HR-still-pending subset — "pending" from the backend also includes
  // requests still waiting on HOD, which aren't actually an HR task yet and
  // shouldn't show up as an "urgent" action or inflate its notification count.
  const pendingRequests = useHrRequests({ status: "pending", limit: 100 });
  const pendingAppraisals = useAppraisalRequests({ limit: 100 });
  // Fetched once and filtered by `statusDate` client-side, rather than
  // trusting the dashboard payload's built-in "today" counts — that's the
  // only way to answer "who was on leave/OD on some other date" without a
  // backend endpoint for it, and it keeps "today" and any picked date on the
  // exact same code path instead of two different sources of truth.
  const approvedRequests = useHrRequests({ status: "approved", limit: 100 });

  const dateStats = useMemo(() => {
    const rows = approvedRequests.data?.data ?? [];
    const byDepartment = new Map<number, { onLeave: number; onOd: number; onVacation: number }>();
    let onLeave = 0;
    let onOd = 0;
    let onVacation = 0;

    for (const request of rows) {
      if (!isDateInRange(statusDate, request.from_date, request.to_date)) continue;
      const deptId = request.faculty.department.id;
      const entry = byDepartment.get(deptId) ?? { onLeave: 0, onOd: 0, onVacation: 0 };
      if (request.kind === "leave") {
        onLeave += 1;
        entry.onLeave += 1;
        // Vacation is one leave type among several (Casual/Sick/Earned/...) —
        // it's still counted in the general leave tally above, this just
        // breaks it out into its own card too since HR asked to see it
        // separately from other leave types.
        if (request.leave_type?.name.toLowerCase().includes("vacation")) {
          onVacation += 1;
          entry.onVacation += 1;
        }
      } else {
        onOd += 1;
        entry.onOd += 1;
      }
      byDepartment.set(deptId, entry);
    }

    return { onLeave, onOd, onVacation, byDepartment };
  }, [approvedRequests.data, statusDate]);

  const selectedDepartment: HrDepartmentRollup | null = useMemo(() => {
    if (!data || department === ALL_DEPARTMENTS) return null;
    return data.department_overview.find((d) => String(d.id) === department) ?? null;
  }, [data, department]);

  const departmentRows = useMemo(() => {
    if (!data) return [];
    const withDateStats = data.department_overview.map((d) => ({
      ...d,
      on_leave_today: dateStats.byDepartment.get(d.id)?.onLeave ?? 0,
      on_od_today: dateStats.byDepartment.get(d.id)?.onOd ?? 0,
    }));
    if (department === ALL_DEPARTMENTS) return withDateStats;
    return withDateStats.filter((d) => String(d.id) === department);
  }, [data, department, dateStats]);

  const actionableRequests = useMemo(() => {
    const rows = pendingRequests.data?.data ?? [];
    return rows.filter((r) => {
      if (r.hod_approval_status !== "approved" || r.hr_approval_status !== "pending") return false;
      if (selectedDepartment) return r.faculty.department.id === selectedDepartment.id;
      return true;
    });
  }, [pendingRequests.data, selectedDepartment]);

  const actionableAppraisals = useMemo(
    () => (pendingAppraisals.data?.data ?? []).filter((a) => HR_ACTIONABLE_APPRAISAL_STATUSES.has(a.status)),
    [pendingAppraisals.data],
  );

  const selectedDepartmentLeave = selectedDepartment ? (dateStats.byDepartment.get(selectedDepartment.id)?.onLeave ?? 0) : dateStats.onLeave;
  const selectedDepartmentOd = selectedDepartment ? (dateStats.byDepartment.get(selectedDepartment.id)?.onOd ?? 0) : dateStats.onOd;
  const selectedDepartmentVacation = selectedDepartment
    ? (dateStats.byDepartment.get(selectedDepartment.id)?.onVacation ?? 0)
    : dateStats.onVacation;
  const rosterSize = selectedDepartment
    ? selectedDepartment.total_faculty
    : (data?.department_overview.reduce((sum, d) => sum + d.total_faculty, 0) ?? 0);
  const leavePercent = rosterSize ? (selectedDepartmentLeave / rosterSize) * 100 : 0;
  const odPercent = rosterSize ? (selectedDepartmentOd / rosterSize) * 100 : 0;
  const vacationPercent = rosterSize ? (selectedDepartmentVacation / rosterSize) * 100 : 0;

  return (
    <div>
      <PageHeader
        eyebrow={authUser && `${greetingForHour(new Date().getHours())}, ${roleDisplayName(authUser.role)}`}
        title="HR Dashboard"
        description="Monitor requests, appraisals, payroll, and faculty activity."
        actions={
          <button
            onClick={() => setPendingActionsOpen(true)}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            <ClockIcon className="h-4 w-4" />
            Review Pending Actions
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load the dashboard."}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32.5 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="dashboard-department" className="text-sm font-medium text-slate-600">
                Department
              </label>
              <SelectInput
                id="dashboard-department"
                className="w-auto"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value={ALL_DEPARTMENTS}>All Departments</option>
                {data.department_overview.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name}
                  </option>
                ))}
              </SelectInput>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="dashboard-status-date" className="text-sm font-medium text-slate-600">
                Status for
              </label>
              <TextInput
                id="dashboard-status-date"
                type="date"
                className="w-auto"
                value={statusDate}
                onChange={(e) => setStatusDate(e.target.value || todayIso())}
              />
              {!isToday && (
                <Button variant="secondary" size="sm" onClick={() => setStatusDate(todayIso())}>
                  Today
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            <HRStatCard
              icon={ClockIcon}
              iconClassName="bg-rose-50 text-rose-600"
              label="Pending Requests"
              value={actionableRequests.length}
              caption="Leave + OD awaiting HR action"
              cornerDot={actionableRequests.length > 0}
              onClick={() => setPendingActionsOpen(true)}
            />

            <Link href="/hr/vacation-management" className="block h-full">
              <HRStatCard
                icon={CalendarIcon}
                iconClassName="bg-amber-50 text-amber-600"
                label={isToday ? "Today's Leave" : `Leave — ${formatDisplayDate(statusDate)}`}
                value={`${leavePercent.toFixed(1)}%`}
                caption={`${selectedDepartmentLeave} of ${rosterSize} faculty ${isToday ? "on leave today" : `on leave on ${formatDisplayDate(statusDate)}`}`}
                progressPercent={leavePercent}
              />
            </Link>

            <Link href="/hr/vacation-management" className="block h-full">
              <HRStatCard
                icon={CalendarIcon}
                iconClassName="bg-cyan-50 text-cyan-600"
                label={isToday ? "Today's Vacation" : `Vacation — ${formatDisplayDate(statusDate)}`}
                value={`${vacationPercent.toFixed(1)}%`}
                caption={`${selectedDepartmentVacation} of ${rosterSize} faculty ${isToday ? "on vacation leave today" : `on vacation leave on ${formatDisplayDate(statusDate)}`}`}
                progressPercent={vacationPercent}
              />
            </Link>

            <Link href="/hr/vacation-management" className="block h-full">
              <HRStatCard
                icon={BriefcaseIcon}
                iconClassName="bg-blue-50 text-blue-600"
                label={isToday ? "Today's OD" : `OD — ${formatDisplayDate(statusDate)}`}
                value={`${odPercent.toFixed(1)}%`}
                caption={`${selectedDepartmentOd} of ${rosterSize} faculty ${isToday ? "on official duty today" : `on official duty on ${formatDisplayDate(statusDate)}`}`}
                progressPercent={odPercent}
              />
            </Link>

            <Link href="/hr/employee-reviews" className="block h-full">
              <HRStatCard
                icon={AwardIcon}
                iconClassName="bg-purple-50 text-purple-600"
                label="Pending Appraisals"
                value={`${data.pending_appraisals_count} reviews`}
                caption="HOD-reviewed, awaiting HR"
                cornerDot={data.pending_appraisals_count > 0}
              />
            </Link>

            <Link href="/hr/payroll" className="block h-full">
              <HRStatCard
                icon={RupeeIcon}
                iconClassName="bg-green-50 text-green-600"
                label="Payroll Status"
                value={`${data.payroll.completion_percent}% Complete`}
                caption={`${data.payroll.processed_count} of ${data.payroll.total_active_faculty} faculty this month`}
                cornerDot={data.payroll.completion_percent < 100}
                progressPercent={data.payroll.completion_percent}
              />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <BarChartIcon className="h-4.5 w-4.5 text-slate-400" />
                    Department Overview
                  </h3>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/hr/departments"
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View All Departments
                    </Link>
                    <Link
                      href="/hr/reports"
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View Reports
                    </Link>
                  </div>
                </div>
                <DataTable<HrDepartmentRollup>
                  columns={[
                    { key: "name", header: "Department" },
                    { key: "total_faculty", header: "Total Faculty" },
                    {
                      key: "on_leave_today",
                      header: isToday ? "On Leave Today" : `On Leave — ${formatDisplayDate(statusDate)}`,
                      render: (row) =>
                        `${row.on_leave_today} (${row.total_faculty ? ((row.on_leave_today / row.total_faculty) * 100).toFixed(1) : "0.0"}%)`,
                    },
                    {
                      key: "on_od_today",
                      header: isToday ? "On OD Today" : `On OD — ${formatDisplayDate(statusDate)}`,
                      render: (row) =>
                        `${row.on_od_today} (${row.total_faculty ? ((row.on_od_today / row.total_faculty) * 100).toFixed(1) : "0.0"}%)`,
                    },
                    { key: "pending_requests", header: "Pending Requests" },
                    {
                      key: "appraisal_status",
                      header: "Appraisal Status",
                      render: (row) => (
                        <StatusPill tone={APPRAISAL_STATUS_TONE[row.appraisal_status]}>
                          {APPRAISAL_STATUS_LABEL[row.appraisal_status]}
                        </StatusPill>
                      ),
                    },
                  ]}
                  rows={departmentRows}
                  rowKey={(row) => row.id}
                  emptyMessage="No data for this department."
                  onRowClick={(row) => router.push(`/hr/departments/${row.id}`)}
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
                <p className="mt-4 text-sm text-slate-500">
                  Activity tracking for leave/OD/appraisal/payroll actions isn&apos;t available yet.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {QUICK_ACTIONS.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 p-3.5 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <action.icon className="h-5 w-5 text-blue-700" />
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-base font-bold text-slate-900">Payroll Summary</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {data.payroll.processed_count} of {data.payroll.total_active_faculty} faculty processed this month
                </p>

                <div className="mt-4">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${data.payroll.completion_percent}%` }}
                    />
                  </div>
                </div>

                <Link
                  href="/hr/payroll"
                  className="mt-5 flex w-full items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                >
                  Review & Finalize Payroll
                </Link>
              </div>
            </div>
          </div>

          <PendingActionsDrawer
            open={pendingActionsOpen}
            requests={actionableRequests}
            appraisals={actionableAppraisals}
            onClose={() => setPendingActionsOpen(false)}
          />
        </>
      )}
    </div>
  );
}

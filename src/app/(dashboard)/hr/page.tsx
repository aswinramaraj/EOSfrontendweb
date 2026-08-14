"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/shared/components/ui/DataTable";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import {
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  ListIcon,
  RupeeIcon,
  XIcon,
} from "@/shared/components/icons";
import { HRCard } from "@/modules/hr/components/ui/HRCard";
import { HRPill } from "@/modules/hr/components/ui/HRPill";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRPageSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import { useHrDashboard } from "@/modules/hr/hooks/useHrDashboard";
import { useHrRequests, useHrRequestDecision } from "@/modules/hr/hooks/useHrRequests";
import { usePayslipRequests } from "@/modules/hr/hooks/usePayslipRequests";
import { useLeaveTypes } from "@/modules/hr/hooks/useLeaveTypes";
import { useFacultyAttendanceOverview } from "@/modules/faculty/hooks/useFacultyAttendanceOverview";
import { appraisalRequestsService } from "@/modules/hr/services/appraisal-requests.service";
import { hrPayrollService } from "@/modules/hr/services/hr-payroll.service";
import { fetchAllPages } from "@/modules/faculty/lib/report-export";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { exportAttendanceSummaryPdf } from "@/modules/faculty/lib/faculty-report-pdfs";
import { useVacancies } from "@/modules/hr/local/recruitment-store";
import { useOnboardingCases } from "@/modules/hr/local/onboarding-exits-store";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { displayNameFromEmail } from "@/modules/hr/lib/hr-display-name";
import { useToast } from "@/shared/components/ui/ToastProvider";
import type { DepartmentAppraisalRollupStatus, HrDepartmentRollup, HrUnifiedRequest } from "@/modules/hr/types/api";

type Scope = "today" | "month" | "year";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function isDateInRange(dateIso: string, fromIso: string, toIso: string): boolean {
  return dateIso >= fromIso.slice(0, 10) && dateIso <= toIso.slice(0, 10);
}

// Whether a request's [from, to] span overlaps the selected scope's window
// (today / the current calendar month / the current calendar year) — real
// date-range overlap, not just an exact "today" match, so switching the
// Today/This month/This year tabs actually changes what's counted.
function isRequestInScope(fromIso: string, toIso: string, scope: Scope, todayIso: string): boolean {
  const from = fromIso.slice(0, 10);
  const to = toIso.slice(0, 10);
  if (scope === "today") return isDateInRange(todayIso, from, to);
  const [year, month] = todayIso.split("-");
  const windowStart = scope === "month" ? `${year}-${month}-01` : `${year}-01-01`;
  const windowEnd = scope === "month" ? `${year}-${month}-31` : `${year}-12-31`;
  return from <= windowEnd && to >= windowStart;
}

function datesBetween(fromIso: string, toIso_: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(fromIso);
  const end = new Date(toIso_);
  while (cursor <= end) {
    dates.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function formatFullDate(dateIso: string): string {
  return new Date(`${dateIso}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatRupees(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(1)} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
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

const APPRAISAL_PIPELINE_STEPS: { key: "submitted" | "hod_reviewed" | "hr_scored" | "management_approved" | "rejected"; label: string }[] = [
  { key: "submitted", label: "Self-appraisal submitted" },
  { key: "hod_reviewed", label: "HOD reviewed" },
  { key: "hr_scored", label: "HR scored" },
  { key: "management_approved", label: "Principal approved" },
  { key: "rejected", label: "Rejected / sent back" },
];

export default function HRDashboardPage() {
  const router = useRouter();
  const { show } = useToast();
  const authUser = useAuthUser();
  const [scope, setScope] = useState<Scope>("today");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportPending, setExportPending] = useState(false);
  // Captured once per mount rather than called inline during render (which
  // React's purity rule flags as an impure Date.now() call) — fine for a
  // "how stale is this" check that doesn't need to tick live.
  const [nowMs] = useState(() => Date.now());

  const { data, isLoading, error } = useHrDashboard();
  const pendingRequests = useHrRequests({ status: "pending", limit: 100 });
  const approvedRequests = useHrRequests({ status: "approved", limit: 100 });
  // The backend caps `limit` at 100 per page — with 642+ faculty there can
  // be well over 100 appraisal/payroll records, so these page through the
  // full set (same fetchAllPages helper the Reports page's exports use)
  // rather than requesting an over-limit page size that 400s, or silently
  // under-counting the dashboard's aggregates.
  const appraisals = useQuery({
    queryKey: ["hr", "dashboard", "appraisals-all"],
    queryFn: () => fetchAllPages((page, limit) => appraisalRequestsService.list({ page, limit })),
  });
  const attendanceOverview = useFacultyAttendanceOverview({});
  const currentMonth = currentMonthKey();
  const payroll = useQuery({
    queryKey: ["hr", "dashboard", "payroll-all", currentMonth],
    queryFn: () => fetchAllPages((page, limit) => hrPayrollService.list({ month: currentMonth, page, limit })),
  });
  const payslipRequests = usePayslipRequests({ status: "pending", limit: 100 });
  const { data: leaveTypes } = useLeaveTypes();
  const { data: vacancies } = useVacancies();
  const { data: onboardingCases } = useOnboardingCases();
  const decision = useHrRequestDecision();

  const today = todayIso();

  const actionableRequests = useMemo(
    () =>
      (pendingRequests.data?.data ?? []).filter(
        (r) => r.hod_approval_status === "approved" && r.hr_approval_status === "pending",
      ),
    [pendingRequests.data],
  );
  const actionableAppraisals = useMemo(
    () => (appraisals.data?.rows ?? []).filter((a) => a.status === "hod_reviewed" || a.status === "hr_scored"),
    [appraisals.data],
  );

  const rosterSize = data?.department_overview.reduce((sum, d) => sum + d.total_faculty, 0) ?? 0;

  // "Reported on duty" — real biometric-derived present count for today.
  const todayAttendance = attendanceOverview.data?.today;
  const presentToday = todayAttendance ? todayAttendance.full_days + todayAttendance.half_days : 0;

  // "August payroll" — real sum across this month's payroll records.
  const payrollRecords = payroll.data?.rows ?? [];
  const grossThisMonth = payrollRecords.reduce((sum, r) => sum + r.gross_amount, 0);

  // Leave/OD breakdown for whichever scope is selected — split by leave
  // type name where possible, matching the reference's "Casual leave" /
  // "Earned / vacation" split. Counts distinct requests whose date range
  // overlaps the scope's window, not just an exact "today" match, so the
  // Today/This month/This year tabs actually change what's shown.
  const approvedInScope = useMemo(
    () => (approvedRequests.data?.data ?? []).filter((r) => isRequestInScope(r.from_date, r.to_date, scope, today)),
    [approvedRequests.data, scope, today],
  );
  const casualInScope = approvedInScope.filter((r) => r.kind === "leave" && r.leave_type?.name.toLowerCase().includes("casual")).length;
  const earnedInScope = approvedInScope.filter(
    (r) => r.kind === "leave" && (r.leave_type?.name.toLowerCase().includes("earned") || r.leave_type?.name.toLowerCase().includes("vacation")),
  ).length;
  const onDutyInScope = approvedInScope.filter((r) => r.kind === "od").length;
  // Unaccounted-absence is a same-day biometric-vs-leave check the backend
  // only computes for "today" — there's no month/year equivalent, so this
  // stays a today snapshot regardless of the selected scope.
  const unaccountedAbsentToday = (attendanceOverview.data?.rows ?? []).filter((r) => r.is_unaccounted_absent_today).length;

  const scopeLabel = scope === "today" ? "Today" : scope === "month" ? "This month" : "This year";

  // "Reported on duty" — today's scope shows the real biometric present
  // count/percent for today; month/year scope has no biometric aggregate
  // for a period, so it shows the real per-faculty attendance % (the same
  // "year to date" figure the Faculty Attendance page's own column uses)
  // averaged across the roster instead of quietly reusing today's number.
  const avgAttendancePercent = useMemo(() => {
    const rows = attendanceOverview.data?.rows ?? [];
    if (rows.length === 0) return 0;
    return Math.round(rows.reduce((sum, r) => sum + r.attendance_percentage, 0) / rows.length);
  }, [attendanceOverview.data]);

  // Leave balance utilisation — academic-year-to-date days taken per leave
  // type, against that type's per-faculty annual quota × roster size.
  const currentYear = new Date().getFullYear();
  const leaveUtilisation = useMemo(() => {
    const rows = approvedRequests.data?.data ?? [];
    return (leaveTypes ?? []).map((lt) => {
      const daysTaken = rows
        .filter((r) => r.kind === "leave" && r.leave_type?.id === lt.id)
        .reduce((sum, r) => sum + datesBetween(r.from_date, r.to_date).filter((d) => d.startsWith(`${currentYear}`)).length, 0);
      const capacity = lt.default_annual_quota * Math.max(1, rosterSize);
      const percent = capacity ? Math.min(100, (daysTaken / capacity) * 100) : 0;
      return { leaveType: lt, percent };
    });
  }, [approvedRequests.data, leaveTypes, currentYear, rosterSize]);

  // Appraisal cycle pipeline — real counts across every fetched request.
  const allAppraisals = useMemo(() => appraisals.data?.rows ?? [], [appraisals.data]);
  const appraisalCountByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of allAppraisals) counts[a.status] = (counts[a.status] ?? 0) + 1;
    return counts;
  }, [allAppraisals]);
  const scoredAppraisals = allAppraisals.filter((a) => a.entries.some((e) => e.score !== null));
  const appraisalScores = scoredAppraisals.map((a) => {
    const max = a.entries.reduce((sum, e) => sum + e.criteria.max_score, 0);
    const score = a.entries.reduce((sum, e) => sum + (e.score ?? 0), 0);
    return max ? (score / max) * 100 : 0;
  });
  const meanScore = appraisalScores.length ? appraisalScores.reduce((a, b) => a + b, 0) / appraisalScores.length : null;
  const belowThresholdCount = appraisalScores.filter((s) => s < 50).length;

  // Needs attention — only real, computed flags; nothing fabricated.
  const slaBreaches = actionableRequests.filter((r) => nowMs - new Date(r.created_at).getTime() > 48 * 60 * 60 * 1000);
  const notStartedDepartments = (data?.department_overview ?? []).filter((d) => d.appraisal_status === "not_started");
  const probationDueCount = (onboardingCases ?? []).filter((c) => c.type === "onboarding" && c.probationReviewDue).length;

  const needsAttention = [
    slaBreaches.length > 0 && {
      label: `${slaBreaches.length} approval${slaBreaches.length === 1 ? "" : "s"} past the 48-hour SLA`,
      caption: "Leave and OD requests awaiting HR",
    },
    unaccountedAbsentToday > 0 && {
      label: `${unaccountedAbsentToday} unapproved absence${unaccountedAbsentToday === 1 ? "" : "s"} today`,
      caption: "No leave record against biometric miss",
    },
    belowThresholdCount > 0 && {
      label: `${belowThresholdCount} faculty scored below 50 in appraisal`,
      caption: "Improvement plans may be needed",
    },
    notStartedDepartments.length > 0 && {
      label: `${notStartedDepartments[0].name} appraisal cycle not started`,
      caption: `${notStartedDepartments[0].total_faculty} staff in this department`,
    },
    probationDueCount > 0 && {
      label: `${probationDueCount} probation review${probationDueCount === 1 ? "" : "s"} due`,
      caption: "Confirmation letters pending HR sign-off",
    },
  ].filter(Boolean) as { label: string; caption: string }[];

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function approveOne(request: HrUnifiedRequest) {
    decision.mutate(
      { kind: request.kind, sourceId: request.source_id, decision: "approved" },
      { onError: (err) => show(err instanceof ApiError ? err.message : "Failed to approve.", "error") },
    );
  }

  function rejectOne(request: HrUnifiedRequest) {
    decision.mutate(
      { kind: request.kind, sourceId: request.source_id, decision: "rejected" },
      { onError: (err) => show(err instanceof ApiError ? err.message : "Failed to reject.", "error") },
    );
  }

  function approveSelected() {
    const rows = actionableRequests.filter((r) => selectedIds.has(r.id));
    for (const request of rows) approveOne(request);
    setSelectedIds(new Set());
  }

  const displayName = authUser ? displayNameFromEmail(authUser.email) : "";

  async function handleExportRegister() {
    const rows = attendanceOverview.data?.rows ?? [];
    if (rows.length === 0) {
      show("No attendance data to export yet.", "info");
      return;
    }
    setExportPending(true);
    try {
      await exportAttendanceSummaryPdf(rows, { academicYear: "Current" });
      show("Attendance register exported.", "success");
    } catch {
      show("Couldn't generate the register.", "error");
    } finally {
      setExportPending(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black leading-tight tracking-tight text-slate-900 sm:text-[34px]">
            {greetingForHour(new Date().getHours())}, {displayName || "there"}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {formatFullDate(today)} · {rosterSize} staff on roll
          </p>
        </div>
        {actionableRequests.length > 0 && (
          <button
            onClick={() => router.push("/hr/requests?tab=pending")}
            className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
          >
            <AlertTriangleIcon className="h-4 w-4" />
            {actionableRequests.length} approvals are waiting on HR
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load the dashboard."}
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-xs">
          <HRSegmentedTabs
            value={scope}
            onChange={setScope}
            options={[
              { value: "today", label: "Today" },
              { value: "month", label: "This month" },
              { value: "year", label: "This year" },
            ]}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" isPending={exportPending} onClick={handleExportRegister}>
            <DownloadIcon className="h-4 w-4" />
            Export register
          </Button>
          <Button variant="primary" onClick={() => router.push("/hr/requests?tab=pending")}>
            Review pending actions
          </Button>
        </div>
      </div>

      {isLoading && (
        <HRPageSkeleton statCount={4} cardCount={3} cardContentClassName="h-36" blockCount={2} blockContentClassName="h-56" />
      )}

      {!isLoading && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/hr/faculty-directory" className="block h-full">
              <HRStatCard
                icon={ListIcon}
                iconClassName="bg-[#EEF2FF] text-[#2655DA]"
                label="Faculty & staff on roll"
                value={rosterSize}
                caption={`Across ${data.department_overview.length} departments`}
                progressPercent={rosterSize ? 100 : 0}
              />
            </Link>
            <Link href="/hr/faculty-attendance" className="block h-full">
              <HRStatCard
                icon={ClockIcon}
                iconClassName="bg-[#EEF2FF] text-[#2655DA]"
                label={scope === "today" ? "Reported on duty" : `Attendance — ${scopeLabel}`}
                value={scope === "today" ? presentToday : `${avgAttendancePercent}%`}
                caption={
                  scope === "today"
                    ? todayAttendance
                      ? `${todayAttendance.attendance_percentage}% attendance today`
                      : "—"
                    : `Average across ${rosterSize} faculty`
                }
                progressPercent={scope === "today" ? todayAttendance?.attendance_percentage : avgAttendancePercent}
              />
            </Link>
            <Link href="/hr/requests?tab=pending" className="block h-full">
              <HRStatCard
                icon={CheckIcon}
                iconClassName="bg-[#EEF2FF] text-[#2655DA]"
                label="Pending HR approvals"
                value={actionableRequests.length + actionableAppraisals.length}
                caption={`${actionableRequests.filter((r) => r.kind === "leave").length} leave · ${actionableRequests.filter((r) => r.kind === "od").length} OD · ${actionableAppraisals.length} appraisal`}
                progressPercent={rosterSize ? ((actionableRequests.length + actionableAppraisals.length) / rosterSize) * 100 : 0}
              />
            </Link>
            <Link href="/hr/payroll" className="block h-full">
              <HRStatCard
                icon={RupeeIcon}
                iconClassName="bg-[#EEF2FF] text-[#2655DA]"
                label={`${new Date().toLocaleDateString("en-IN", { month: "long" })} payroll`}
                value={formatRupees(grossThisMonth)}
                caption={`${data.payroll.completion_percent}% verified · ${data.payroll.processed_count} of ${data.payroll.total_active_faculty}`}
                progressPercent={data.payroll.completion_percent}
              />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <HRCard
              title={`Attendance & leave — ${scopeLabel}`}
              actions={
                <Link href="/hr/faculty-attendance" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  Detail ›
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Casual leave</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{casualInScope}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Earned / vacation</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{earnedInScope}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">On official duty</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{onDutyInScope}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Unapproved absence{scope !== "today" ? " (today)" : ""}</p>
                  <p className="mt-1 text-2xl font-black text-[#2655DA]">{unaccountedAbsentToday}</p>
                </div>
              </div>

              {leaveUtilisation.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-3 text-xs text-slate-500">Leave balance utilisation · academic year to date</p>
                  <div className="flex flex-col gap-3">
                    {leaveUtilisation.map(({ leaveType, percent }) => (
                      <div key={leaveType.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="text-slate-700">
                            {leaveType.name} ({leaveType.default_annual_quota}/yr)
                          </span>
                          <span className="font-semibold text-slate-900">{percent.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </HRCard>

            <HRCard
              title="Approvals queue"
              actions={slaBreaches.length > 0 ? <HRPill tone="blue">{slaBreaches.length} overdue</HRPill> : undefined}
            >
              <div className="flex flex-col divide-y divide-slate-100">
                {actionableRequests.slice(0, 4).map((request) => (
                  <div key={request.id} className="flex items-center gap-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(request.id)}
                      onChange={() => toggleSelected(request.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{fullName(request.faculty)}</p>
                      <p className="text-xs text-slate-500">
                        {request.faculty.department.name} · {request.kind === "leave" ? "Casual leave" : "OD"}
                      </p>
                    </div>
                    <button
                      onClick={() => approveOne(request)}
                      disabled={decision.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EEF2FF] text-[#2655DA] hover:bg-[#E0E7FF]"
                      aria-label="Approve"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => rejectOne(request)}
                      disabled={decision.isPending}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200"
                      aria-label="Reject"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {actionableRequests.length === 0 && <p className="py-6 text-center text-sm text-slate-500">Nothing waiting on you.</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" className="flex-1" disabled={selectedIds.size === 0} onClick={approveSelected}>
                  Approve selected ({selectedIds.size})
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => router.push("/hr/requests")}>
                  Open queue
                </Button>
              </div>
            </HRCard>

            <HRCard title="Needs attention" actions={<HRPill tone="blue">{needsAttention.length} flags</HRPill>}>
              {needsAttention.length === 0 ? (
                <p className="text-sm text-slate-500">Nothing needs attention right now.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {needsAttention.map((item) => (
                    <li key={item.label} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.caption}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </HRCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <HRCard
                title="Department overview"
                actions={
                  <div className="flex items-center gap-2">
                    <Link href="/hr/departments">
                      <Button variant="secondary" size="sm">
                        All departments
                      </Button>
                    </Link>
                    <Link href="/hr/reports">
                      <Button variant="secondary" size="sm">
                        Reports
                      </Button>
                    </Link>
                  </div>
                }
              >
                <DataTable<HrDepartmentRollup>
                  columns={[
                    { key: "name", header: "Department" },
                    { key: "total_faculty", header: "Total Faculty" },
                    {
                      key: "on_leave_today",
                      header: "On Leave Today",
                      render: (row) =>
                        `${row.on_leave_today} (${row.total_faculty ? ((row.on_leave_today / row.total_faculty) * 100).toFixed(1) : "0.0"}%)`,
                    },
                    {
                      key: "on_od_today",
                      header: "On OD Today",
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
                  rows={data.department_overview}
                  rowKey={(row) => row.id}
                  onRowClick={(row) => router.push(`/hr/departments/${row.id}`)}
                />
              </HRCard>
            </div>

            <HRCard
              title={`Appraisal cycle ${currentYear}–${String((currentYear + 1) % 100).padStart(2, "0")}`}
              actions={
                <Link href="/hr/employee-reviews" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  Open ›
                </Link>
              }
            >
              <div className="flex flex-col gap-3">
                {APPRAISAL_PIPELINE_STEPS.map((step) => {
                  const count = appraisalCountByStatus[step.key] ?? 0;
                  const percent = allAppraisals.length ? (count / allAppraisals.length) * 100 : 0;
                  return (
                    <div key={step.key}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-700">{step.label}</span>
                        <span className="font-semibold text-slate-900">
                          {count} / {allAppraisals.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">Mean score</span>
                <span className="font-semibold text-slate-900">{meanScore != null ? `${meanScore.toFixed(1)} / 100` : "—"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Below threshold (&lt;50)</span>
                <Link href="/hr/employee-reviews" className="font-semibold text-blue-700 hover:text-blue-800">
                  {belowThresholdCount} faculty ›
                </Link>
              </div>
            </HRCard>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <HRCard
              title="Payroll & compliance"
              className="lg:col-span-1"
              actions={
                <Link href="/hr/payroll" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  Open run ›
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Gross this month</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{formatRupees(grossThisMonth)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Payslip requests open</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{payslipRequests.data?.data.length ?? 0}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">Form 16 issued</span>
                <span className="font-semibold text-slate-900">{data.payroll.processed_count} / {data.payroll.total_active_faculty}</span>
              </div>
            </HRCard>

            <HRCard
              title="Recruitment pipeline"
              actions={
                <Link href="/hr/recruitment" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  {(vacancies ?? []).reduce((sum, v) => sum + v.positions, 0)} open roles ›
                </Link>
              }
            >
              {(vacancies ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No open positions yet.</p>
              ) : (
                <div className="flex flex-col divide-y divide-slate-100">
                  {(vacancies ?? []).slice(0, 4).map((vacancy) => (
                    <div key={vacancy.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{vacancy.role}</p>
                        <p className="text-xs text-slate-500">
                          {vacancy.departmentName} · {vacancy.positions} position{vacancy.positions === 1 ? "" : "s"}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold capitalize text-slate-500">{vacancy.stage}</span>
                    </div>
                  ))}
                </div>
              )}
            </HRCard>

            <HRCard
              title="Recent activity"
              actions={
                <Link href="/hr/requests" className="text-sm font-medium text-blue-700 hover:text-blue-800">
                  View all ›
                </Link>
              }
            >
              {(approvedRequests.data?.data ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No activity recorded yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-slate-100">
                  {[...(approvedRequests.data?.data ?? [])]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 4)
                    .map((r) => (
                      <li key={r.id} className="py-2.5">
                        <p className="text-sm text-slate-800">
                          {r.kind === "leave" ? "Leave" : "OD"} approved for {fullName(r.faculty)}
                        </p>
                        <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </li>
                    ))}
                </ul>
              )}
            </HRCard>
          </div>
        </>
      )}
    </div>
  );
}

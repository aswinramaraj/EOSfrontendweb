"use client";

import { useState } from "react";
import { useAuthUser } from "@/modules/auth/hooks/useAuthUser";
import { ApiError } from "@/shared/lib/api-client";
import { Button } from "@/shared/components/ui/Button";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import {
  AlertTriangleIcon,
  BriefcaseIcon,
  CalendarCheckIcon,
  CertificateIcon,
  DownloadIcon,
  GraduationCapIcon,
  PeopleIcon,
  PersonIcon,
  RupeeIcon,
  SendIcon,
  UserPlusIcon,
  WalletIcon,
  ZapIcon,
} from "@/shared/components/icons";
import { DonutChart, HorizontalBarChart, VerticalBarChart } from "@/shared/components/ui/charts";
import {
  useActiveStudentCount,
  useFacultyCount,
  useFinanceOverview,
  useStudentStatusDistribution,
  useStudentsByDepartment,
} from "@/modules/admin/hooks/useAdminDashboard";
import { KpiCard } from "@/modules/admin/components/KpiCard";
import { DashboardCard } from "@/modules/admin/components/DashboardCard";
import { PendingNotice } from "@/modules/admin/components/PendingNotice";
import { QuickActionsCard } from "@/modules/admin/components/QuickActionsCard";
import { currencyShort, monthShortLabel, percent1 } from "@/modules/admin/lib/format";

const QUICK_ACTIONS = [
  { icon: UserPlusIcon, label: "Admit student", note: "Start a new admission" },
  { icon: RupeeIcon, label: "Collect fee", note: "Record a payment" },
  { icon: CertificateIcon, label: "Issue certificate", note: "Bonafide, conduct, transcript" },
  { icon: SendIcon, label: "Send notice", note: "Email / SMS / push" },
];

const ADMISSIONS_PENDING =
  "Needs the SOA Applications list backend — currently unimplemented on the server.";
const ATTENDANCE_PENDING =
  "Needs a new attendance-summary aggregate endpoint — none exists yet.";
const PLACEMENT_PENDING =
  "Needs a new placement-rate aggregate endpoint — none exists yet.";
const APPROVALS_PENDING =
  "Needs a new endpoint unifying pending requests across bonafide, OD, leaves, revaluation and fee concessions.";
const GRADUATED_NOT_TRACKED =
  "Not tracked — students.status only has active/inactive in the schema today, no graduated/alumni state.";
const ACTIVITY_NOT_AVAILABLE =
  "No audit/event table exists in the schema, so this feed has no real source yet.";

const TIME_RANGES = [
  { value: "today", label: "Today" },
  { value: "term", label: "This term" },
  { value: "year", label: "This year" },
] as const;
type TimeRange = (typeof TIME_RANGES)[number]["value"];

export default function AdminDashboardPage() {
  const user = useAuthUser();
  const [timeRange, setTimeRange] = useState<TimeRange>("term");
  const finance = useFinanceOverview();
  const facultyCount = useFacultyCount();
  const activeStudents = useActiveStudentCount();
  const statusDistribution = useStudentStatusDistribution();
  const studentsByDept = useStudentsByDepartment();

  const greetingName = user?.email ? user.email.split("@")[0] : "there";
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const kpis = finance.data?.executiveKPIs;
  const monthlyTrend = finance.data?.financialAnalytics.monthlyCollectionTrend ?? [];
  const departmentOutstanding = finance.data?.financialAnalytics.departmentOutstanding ?? [];
  const paymentStatus = finance.data?.financialAnalytics.paymentStatusDistribution ?? [];

  const financeError =
    finance.error instanceof ApiError ? finance.error.message : finance.error ? "Failed to load finance data." : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Good {timeOfDay}, {greetingName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Institution overview · Admin Console</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Every figure below is a point-in-time total, not a windowed query
              — no endpoint here supports "as of today" vs "this year" yet, so
              this only changes which segment looks selected. Kept visible
              rather than removed so the affordance isn't silently missing. */}
          <SegmentedControl options={[...TIME_RANGES]} value={timeRange} onChange={setTimeRange} />
          <Button variant="secondary" disabled title="Export board — not built yet">
            <DownloadIcon className="h-4 w-4" /> Export board
          </Button>
          <Button variant="primary" disabled title="Quick actions — see the panel below for now">
            <ZapIcon className="h-4 w-4" /> Quick actions
          </Button>
        </div>
      </div>

      {financeError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {financeError}
        </p>
      )}

      {/* ---- KPI grid --------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active students"
          icon={PeopleIcon}
          tone="info"
          value={activeStudents.data !== undefined ? activeStudents.data : activeStudents.isLoading ? "…" : "—"}
        />
        <KpiCard label="Admissions this cycle" icon={UserPlusIcon} tone="neutral" pendingReason={ADMISSIONS_PENDING} />
        <KpiCard label="Mean attendance" icon={CalendarCheckIcon} tone="warning" pendingReason={ATTENDANCE_PENDING} />
        <KpiCard
          label="Fee collected"
          icon={WalletIcon}
          tone="success"
          value={kpis ? currencyShort(kpis.totalCollected) : finance.isLoading ? "…" : "—"}
          trend={kpis ? { dir: "up", value: percent1(kpis.collectionPercentage), note: "of demand" } : undefined}
          spark={monthlyTrend.length > 1 ? monthlyTrend.map((m) => Number(m.totalCollected)) : undefined}
        />
        <KpiCard
          label="Fee outstanding"
          icon={AlertTriangleIcon}
          tone="warning"
          value={kpis ? currencyShort(kpis.totalOutstanding) : finance.isLoading ? "…" : "—"}
          trend={
            kpis ? { dir: "down", value: String(kpis.pendingEducationLoanDD), note: "loan DDs pending" } : undefined
          }
        />
        <KpiCard label="Placement rate" icon={BriefcaseIcon} tone="info" pendingReason={PLACEMENT_PENDING} />
        <KpiCard
          label="Faculty on roll"
          icon={PersonIcon}
          tone="neutral"
          value={facultyCount.data ? facultyCount.data.meta.total : facultyCount.isLoading ? "…" : "—"}
        />
        <KpiCard label="Graduated" icon={GraduationCapIcon} tone="success" pendingReason={GRADUATED_NOT_TRACKED} />
      </div>

      {/* ---- Enrolment + distribution ------------------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCard title="Enrolment growth" subtitle="Total students on roll, by admission year">
            <PendingNotice
              reason="Not derivable yet — the schema has no per-student admission-year filter exposed; would need a rule agreed with you (joined_academic_year vs. admission_date vs. batch)."
              height={160}
            />
          </DashboardCard>
        </div>
        <DashboardCard title="Distribution" subtitle="By status">
          {statusDistribution.data && statusDistribution.data.length > 0 ? (
            <DonutChart
              data={statusDistribution.data}
              centerLabel="Students"
              centerValue={statusDistribution.data.reduce((sum, s) => sum + s.value, 0)}
            />
          ) : (
            <PendingNotice reason={statusDistribution.isLoading ? "Loading…" : "No students recorded yet."} height={160} />
          )}
        </DashboardCard>
      </div>

      {/* ---- Year-wise + fee collection ---------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Year-wise headcount" subtitle="Students on roll by study year">
          <PendingNotice
            reason="Not derivable yet — the schema has no per-student study-year field; would need a rule agreed with you (e.g. derived from batch admission year or class semester)."
            height={180}
          />
        </DashboardCard>
        <DashboardCard title="Fee collection" subtitle="₹ collected per month, from real payment records">
          {monthlyTrend.length > 0 ? (
            <VerticalBarChart
              data={monthlyTrend.map((m) => ({ label: monthShortLabel(m.month), value: Number(m.totalCollected) }))}
              height={180}
              format={(v) => currencyShort(v)}
            />
          ) : (
            <PendingNotice reason={finance.isLoading ? "Loading…" : "No fee payments recorded yet."} height={180} />
          )}
        </DashboardCard>
      </div>

      {/* ---- Approvals / fee-outstanding-by-dept · quick actions / attendance risk */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <DashboardCard title="Pending approvals" subtitle="Unified worklist across request types">
            <PendingNotice reason={APPROVALS_PENDING} height={160} />
          </DashboardCard>

          <DashboardCard
            title="Fee outstanding by department"
            subtitle="Real data from /finance-overview — replaces the reference's broader department-comparison table, since student/faculty/attendance figures per department aren't available yet"
            bodyClassName="p-5"
          >
            {departmentOutstanding.length > 0 ? (
              <div className="flex flex-col gap-3">
                {departmentOutstanding.map((d) => (
                  <div key={d.department} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-600">{d.department}</span>
                    <span className="flex items-center gap-3 tabular-nums">
                      <span className="text-slate-400">{currencyShort(d.totalDemand)} demand</span>
                      <span className="font-semibold text-amber-600">{currencyShort(d.totalOutstanding)} due</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <PendingNotice reason={finance.isLoading ? "Loading…" : "No outstanding fee demand recorded."} height={120} />
            )}
          </DashboardCard>
        </div>

        <div className="flex flex-col gap-6">
          <QuickActionsCard actions={QUICK_ACTIONS} />
          <DashboardCard title="Attendance risk" subtitle="Cohorts below the 75% threshold">
            <PendingNotice reason={ATTENDANCE_PENDING} height={160} />
          </DashboardCard>
        </div>
      </div>

      {/* ---- Activity feed + students by department ---------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Recent activity" subtitle="Not available">
          <PendingNotice reason={ACTIVITY_NOT_AVAILABLE} height={160} />
        </DashboardCard>
        <DashboardCard title="Students by department" subtitle="Active headcount per department">
          {studentsByDept.data && studentsByDept.data.length > 0 ? (
            <HorizontalBarChart data={studentsByDept.data} />
          ) : (
            <PendingNotice reason={studentsByDept.isLoading ? "Loading…" : "No students recorded yet."} height={160} />
          )}
        </DashboardCard>
      </div>

      {/* Payment status distribution — bonus real card the reference doesn't
          have, but the finance-overview endpoint already returns it for free. */}
      {paymentStatus.length > 0 && (
        <DashboardCard title="Fee demand status" subtitle="Share of fee-demand mappings by payment status">
          <DonutChart
            data={paymentStatus.map((p) => ({
              label: p.status === "paid" ? "Paid" : p.status === "partial" ? "Partially paid" : "Pending",
              value: p.count,
              color: p.status === "paid" ? "#2563eb" : p.status === "partial" ? "#60a5fa" : "#d4dce6",
            }))}
            centerLabel="Demands"
            centerValue={paymentStatus.reduce((sum, p) => sum + p.count, 0)}
          />
        </DashboardCard>
      )}
    </div>
  );
}

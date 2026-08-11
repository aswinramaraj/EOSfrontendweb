"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ChevronLeftIcon, ChevronRightIcon, EnvelopeIcon, PencilIcon, PhoneIcon } from "@/shared/components/icons";
import { useFacultyById } from "@/modules/faculty/hooks/useFacultyById";
import { useFacultyActivity } from "@/modules/faculty/hooks/useFacultyActivity";
import { useFacultyAttendance } from "@/modules/faculty/hooks/useFacultyAttendance";
import { fullName as formatFacultyName } from "@/modules/faculty/lib/faculty-format";
import { RequestListItem } from "@/modules/hr/components/RequestListItem";
import { RequestDetailDrawer } from "@/modules/hr/components/RequestDetailDrawer";
import { FacultyAttendanceDetail } from "@/modules/hr/components/FacultyAttendanceDetail";
import { FacultyDocumentsPanel } from "@/modules/hr/components/FacultyDocumentsPanel";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { useHrRequests } from "@/modules/hr/hooks/useHrRequests";
import { useAppraisalRequests } from "@/modules/hr/hooks/useAppraisalRequests";
import { useHrPayroll } from "@/modules/hr/hooks/useHrPayroll";
import type { HrUnifiedRequest } from "@/modules/hr/types/api";

type TabKey =
  | "personal"
  | "employment"
  | "documents"
  | "attendance"
  | "od"
  | "appraisal"
  | "payroll"
  | "activity";

const TABS: { value: TabKey; label: string }[] = [
  { value: "personal", label: "Personal Info" },
  { value: "employment", label: "Employment" },
  { value: "documents", label: "Documents" },
  { value: "attendance", label: "Attendance" },
  { value: "od", label: "OD" },
  { value: "appraisal", label: "Appraisal" },
  { value: "payroll", label: "Payroll" },
  { value: "activity", label: "Activity" },
];

const APPRAISAL_STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  hod_reviewed: "HOD Reviewed",
  hr_scored: "HR Scored",
  management_approved: "Approved",
  rejected: "Rejected",
};

const APPRAISAL_STATUS_TONE: Record<string, PillTone> = {
  submitted: "slate",
  hod_reviewed: "blue",
  hr_scored: "blue",
  management_approved: "green",
  rejected: "red",
};

function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function HRFacultyProfilePage() {
  const { facultyId } = useParams<{ facultyId: string }>();
  const id = Number(facultyId);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = (TABS.some((t) => t.value === tabParam) ? tabParam : "personal") as TabKey;
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [selectedRequest, setSelectedRequest] = useState<HrUnifiedRequest | null>(null);

  const { data: faculty, isLoading: facultyLoading } = useFacultyById(id);
  const { data: activity } = useFacultyActivity(id);
  const { data: attendance } = useFacultyAttendance(id);
  const { data: requestsData } = useHrRequests({ faculty_id: id, limit: 100 });
  const { data: appraisalData } = useAppraisalRequests({ faculty_id: id, limit: 5 });
  const { data: payrollData } = useHrPayroll({ faculty_id: id, limit: 12 });

  const allRequests = useMemo(() => requestsData?.data ?? [], [requestsData]);
  const odRequests = useMemo(() => allRequests.filter((r) => r.kind === "od"), [allRequests]);
  const pendingRequestCount = useMemo(
    () => allRequests.filter((r) => r.overall_status === "pending").length,
    [allRequests],
  );
  const latestAppraisal = appraisalData?.data[0] ?? null;
  const payslips = payrollData?.data ?? [];

  if (facultyLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!faculty) {
    return (
      <div>
        <p className="text-sm text-slate-500">Faculty not found.</p>
        <Link href="/hr/faculty-directory" className="text-sm font-medium text-blue-700 hover:text-blue-800">
          ← Back to Faculty Directory
        </Link>
      </div>
    );
  }

  const fullName = formatFacultyName(faculty);

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/hr/faculty-directory" className="hover:text-slate-700">
          Faculty Directory
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">{fullName}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <FacultyAvatar faculty={faculty} className="h-14 w-14 rounded-full text-lg" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {faculty.designation} · {faculty.department?.name ?? "—"} · ID {faculty.id}
            </p>
          </div>
          <StatusPill tone={faculty.status === "active" ? "green" : "slate"}>
            {faculty.status === "active" ? "Active" : "Inactive"}
          </StatusPill>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/hr/faculty-directory/${faculty.id}/edit`}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            <PencilIcon className="h-4 w-4" />
            Edit Profile
          </Link>
          <Link
            href="/hr/faculty-directory"
            className="flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            All Faculty
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full lg:w-56 lg:shrink-0">
          <nav className="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-2">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-md px-4 py-3 text-left text-base font-medium transition-colors ${
                  activeTab === tab.value ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 max-w-4xl">
      {activeTab === "personal" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <dl className="divide-y divide-slate-100">
            {[
              ["Employee ID", String(faculty.id)],
              ["Email", faculty.email],
              ["Phone", faculty.phone ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-col gap-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
            <a href={`mailto:${faculty.email}`} className="flex items-center gap-2 hover:text-blue-700">
              <EnvelopeIcon className="h-4 w-4 text-slate-400" />
              {faculty.email}
            </a>
            {faculty.phone && (
              <a href={`tel:${faculty.phone}`} className="flex items-center gap-2 hover:text-blue-700">
                <PhoneIcon className="h-4 w-4 text-slate-400" />
                {faculty.phone}
              </a>
            )}
          </div>
        </div>
      )}

      {activeTab === "employment" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <dl className="divide-y divide-slate-100">
            {[
              ["Designation", faculty.designation],
              ["Department", faculty.department?.name ?? "—"],
              ["Date of Joining", faculty.date_of_joining ? new Date(faculty.date_of_joining).toLocaleDateString("en-IN") : "—"],
              ["Status", faculty.status === "active" ? "Active" : "Inactive"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-3 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {activeTab === "documents" && <FacultyDocumentsPanel facultyId={faculty.id} />}

      {activeTab === "attendance" && <FacultyAttendanceDetail facultyId={faculty.id} facultyName={fullName} />}

      {activeTab === "od" && (
        <div className="rounded-lg border border-slate-200 bg-white">
          {odRequests.map((request, index) => (
            <RequestListItem key={request.id} request={request} index={index} onOpen={setSelectedRequest} />
          ))}
          {odRequests.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No OD history for this faculty yet.</p>
          )}
        </div>
      )}

      {activeTab === "appraisal" && (
        <div className="flex flex-col gap-4">
          {latestAppraisal ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <StatusPill tone={APPRAISAL_STATUS_TONE[latestAppraisal.status]}>
                  {APPRAISAL_STATUS_LABEL[latestAppraisal.status]}
                </StatusPill>
                <span className="text-sm text-slate-500">{latestAppraisal.academic_year}</span>
              </div>
              <Link
                href="/hr/employee-reviews"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View in Employee Reviews
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
              No appraisal submitted for this cycle yet.
            </p>
          )}
        </div>
      )}

      {activeTab === "payroll" && (
        <div className="flex flex-col gap-4">
          {payslips.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-xs text-slate-500">{entry.month}</p>
                  <p className="text-xs text-slate-500">Gross Salary</p>
                  <p className="text-sm font-semibold text-slate-900">{formatRupees(entry.gross_amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Net Payable</p>
                  <p className="text-sm font-bold text-green-700">{formatRupees(entry.net_amount)}</p>
                </div>
                <StatusPill tone={entry.paid_at ? "green" : "amber"}>
                  {entry.paid_at ? "Processed" : "Pending"}
                </StatusPill>
              </div>
            </div>
          ))}
          {payslips.length === 0 && (
            <p className="rounded-lg border border-slate-200 bg-white py-8 text-center text-sm text-slate-500">
              No payroll records for this faculty yet.
            </p>
          )}
          <Link href="/hr/payroll" className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800">
            View in Payroll
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          {!activity || activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No recorded activity for this faculty yet.</p>
          ) : (
            <div className="flex flex-col">
              {activity.map((entry, index) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                    {index < activity.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-100" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm text-slate-800">{entry.description}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(entry.created_at).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

          {(activeTab === "personal" || activeTab === "employment") && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Attendance</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {attendance ? `${attendance.overall.attendance_percentage}%` : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Pending Requests</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{pendingRequestCount}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm text-slate-500">Latest Appraisal</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {latestAppraisal ? APPRAISAL_STATUS_LABEL[latestAppraisal.status] : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <RequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { ChevronRightIcon, PencilIcon, PrinterIcon } from "@/shared/components/icons";
import { useFacultyById } from "@/modules/faculty/hooks/useFacultyById";
import { useFacultyActivity } from "@/modules/faculty/hooks/useFacultyActivity";
import { useFacultyAttendance } from "@/modules/faculty/hooks/useFacultyAttendance";
import { useFacultyMappings } from "@/modules/faculty/hooks/useFacultyMappings";
import { fullName as formatFacultyName } from "@/modules/faculty/lib/faculty-format";
import { RequestListItem } from "@/modules/hr/components/RequestListItem";
import { RequestDetailDrawer } from "@/modules/hr/components/RequestDetailDrawer";
import { FacultyAttendanceDetail } from "@/modules/hr/components/FacultyAttendanceDetail";
import { FacultyDocumentsPanel } from "@/modules/hr/components/FacultyDocumentsPanel";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { useHrRequests } from "@/modules/hr/hooks/useHrRequests";
import { useAppraisalRequests } from "@/modules/hr/hooks/useAppraisalRequests";
import { useHrPayroll } from "@/modules/hr/hooks/useHrPayroll";
import { HRCard } from "@/modules/hr/components/ui/HRCard";
import { HRPill } from "@/modules/hr/components/ui/HRPill";
import { HRPageSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import type { HrUnifiedRequest } from "@/modules/hr/types/api";

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

function yearsSince(dateString: string | null | undefined): number | null {
  if (!dateString) return null;
  const joined = new Date(dateString);
  if (Number.isNaN(joined.getTime())) return null;
  const years = (Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(years));
}

function formatDate(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function HRFacultyProfilePage() {
  const { facultyId } = useParams<{ facultyId: string }>();
  const id = Number(facultyId);
  const [selectedRequest, setSelectedRequest] = useState<HrUnifiedRequest | null>(null);

  const { data: faculty, isLoading: facultyLoading } = useFacultyById(id);
  const { data: activity } = useFacultyActivity(id);
  const { data: attendance } = useFacultyAttendance(id);
  const { data: requestsData } = useHrRequests({ faculty_id: id, limit: 100 });
  const { data: appraisalData } = useAppraisalRequests({ faculty_id: id, limit: 5 });
  const { data: payrollData } = useHrPayroll({ faculty_id: id, limit: 12 });
  const { data: mappingsData } = useFacultyMappings({ faculty_id: id, limit: 20 });

  const allRequests = useMemo(() => requestsData?.data ?? [], [requestsData]);
  const odRequests = useMemo(() => allRequests.filter((r) => r.kind === "od"), [allRequests]);
  const pendingRequestCount = useMemo(
    () => allRequests.filter((r) => r.overall_status === "pending").length,
    [allRequests],
  );
  const latestAppraisal = appraisalData?.data[0] ?? null;
  const payslips = payrollData?.data ?? [];
  const subjectsHandled = mappingsData?.data ?? [];

  if (facultyLoading) {
    return <HRPageSkeleton statCount={4} cardCount={2} cardContentClassName="h-56" blockCount={1} blockContentClassName="h-40" />;
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
  const experience = yearsSince(faculty.date_of_joining);

  const appointmentRows = [
    ["Employee ID", String(faculty.id)],
    ["Full name", fullName],
    ["Designation", faculty.designation],
    ["Department", faculty.department?.name ?? "—"],
    faculty.specialization ? ["Specialization", faculty.specialization] : null,
    ["Official email", faculty.email],
    faculty.phone ? ["Contact number", faculty.phone] : null,
    formatDate(faculty.date_of_joining) ? ["Date of joining", formatDate(faculty.date_of_joining)!] : null,
    experience != null ? ["Total experience", `${experience} yrs`] : null,
  ].filter(Boolean) as [string, string][];

  const qualificationRows = [
    faculty.previous_institution ? ["Previous institution", faculty.previous_institution] : null,
    faculty.previous_experience_years != null ? ["Previous experience", `${faculty.previous_experience_years} yrs`] : null,
    faculty.qualification ? ["Highest qualification", faculty.qualification] : null,
    faculty.employment_type ? ["Employment type", faculty.employment_type] : null,
    faculty.employment_status ? ["Employment status", faculty.employment_status] : null,
    formatDate(faculty.confirmation_date) ? ["Confirmation date", formatDate(faculty.confirmation_date)!] : null,
    faculty.work_location ? ["Work location", faculty.work_location] : null,
    ["Status", faculty.status === "active" ? "Active" : "Inactive"],
  ].filter(Boolean) as [string, string][];

  const quickFacts = [
    `EMP ${faculty.id}`,
    faculty.qualification,
    formatDate(faculty.date_of_joining) ? `Joined ${formatDate(faculty.date_of_joining)}` : null,
  ].filter(Boolean) as string[];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/hr/faculty-directory" className="hover:text-slate-700">
            ← Back to faculty
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-700">{fullName}</span>
          <span className="text-slate-400">
            · EMP {faculty.id} · {faculty.designation} · {faculty.department?.name ?? "—"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            <PrinterIcon className="h-4 w-4" />
            Print profile
          </Button>
          <Link href={`/hr/faculty-directory/${faculty.id}/edit`}>
            <Button variant="primary">
              <PencilIcon className="h-4 w-4" />
              Edit profile
            </Button>
          </Link>
        </div>
      </div>

      <HRCard className="mb-6" hoverable={false}>
        <div className="flex flex-col gap-6 sm:flex-row">
          <FacultyAvatar faculty={faculty} className="h-28 w-24 shrink-0 rounded-xl text-2xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-[28px]">{fullName}</h1>
            <p className="mt-1 text-base text-slate-500">
              {faculty.designation} · {faculty.department?.name ?? "—"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickFacts.map((fact) => (
                <span key={fact} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                  {fact}
                </span>
              ))}
              <StatusPill tone={faculty.status === "active" ? "green" : "slate"}>
                {faculty.status === "active" ? "Active" : "Inactive"}
              </StatusPill>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-[#EEF2FF] p-4">
            <p className="text-sm text-slate-600">Total experience</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{experience != null ? `${experience} yrs` : "—"}</p>
          </div>
          <div className="rounded-xl bg-[#EEF2FF] p-4">
            <p className="text-sm text-slate-600">Attendance</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {attendance ? `${attendance.overall.attendance_percentage}%` : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-[#EEF2FF] p-4">
            <p className="text-sm text-slate-600">Pending requests</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{pendingRequestCount}</p>
          </div>
          <div className="rounded-xl bg-[#EEF2FF] p-4">
            <p className="text-sm text-slate-600">Latest appraisal</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {latestAppraisal ? APPRAISAL_STATUS_LABEL[latestAppraisal.status] : "—"}
            </p>
          </div>
        </div>
      </HRCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HRCard title="Appointment & contact" hoverable={false}>
          <dl className="divide-y divide-slate-100">
            {appointmentRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </HRCard>

        <HRCard title="Employment & qualification" hoverable={false}>
          <dl className="divide-y divide-slate-100">
            {qualificationRows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="text-right font-medium text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </HRCard>
      </div>

      {subjectsHandled.length > 0 && (
        <div className="mt-6 rounded-xl border-2 border-[#2655DA] bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">Subjects handled</h3>
            <span className="text-sm text-slate-400">{subjectsHandled.length} periods / week</span>
          </div>
          <div className="flex flex-col divide-y divide-slate-100">
            {subjectsHandled.map((mapping) => (
              <div key={mapping.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#2655DA]">{mapping.subject.subject_code}</span>
                  <span className="text-sm text-slate-800">{mapping.subject.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <HRPill tone="blue">{mapping.class.department.code}</HRPill>
                  <span className="text-slate-400">Section {mapping.class.section}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <FacultyDocumentsPanel facultyId={faculty.id} />
      </div>

      <div className="mt-6">
        <FacultyAttendanceDetail facultyId={faculty.id} facultyName={fullName} />
      </div>

      <div className="mt-6">
        <HRCard title="On-duty history" hoverable={false}>
          <div className="-m-5 divide-y divide-slate-100">
            {odRequests.map((request, index) => (
              <RequestListItem key={request.id} request={request} index={index} onOpen={setSelectedRequest} />
            ))}
            {odRequests.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No OD history for this faculty yet.</p>
            )}
          </div>
        </HRCard>
      </div>

      <div className="mt-6">
        <HRCard title="Appraisal" hoverable={false}>
          {latestAppraisal ? (
            <div>
              <div className="flex items-center gap-2">
                <StatusPill tone={APPRAISAL_STATUS_TONE[latestAppraisal.status]}>
                  {APPRAISAL_STATUS_LABEL[latestAppraisal.status]}
                </StatusPill>
                <span className="text-sm text-slate-500">{latestAppraisal.academic_year}</span>
              </div>
              <Link
                href={`/hr/employee-reviews/${latestAppraisal.id}`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                View in Employee Reviews
                <ChevronRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">No appraisal submitted for this cycle yet.</p>
          )}
        </HRCard>
      </div>

      <div className="mt-6">
        <HRCard
          title="Payroll"
          hoverable={false}
          actions={
            <Link href="/hr/payroll" className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800">
              View in Payroll
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          }
        >
          <div className="flex flex-col divide-y divide-slate-100">
            {payslips.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-6 py-3">
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
            ))}
            {payslips.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No payroll records for this faculty yet.</p>
            )}
          </div>
        </HRCard>
      </div>

      <div className="mt-6">
        <HRCard title="Activity" hoverable={false}>
          {!activity || activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No recorded activity for this faculty yet.</p>
          ) : (
            <div className="flex flex-col">
              {activity.map((entry, index) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2655DA]" />
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
        </HRCard>
      </div>

      <RequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}

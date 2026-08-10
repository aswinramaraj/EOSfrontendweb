"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { useToast } from "@/shared/components/ui/ToastProvider";
import {
  ActivityIcon,
  ArrowLeftIcon,
  AwardIcon,
  BookIcon,
  BriefcaseIcon,
  BusIcon,
  CalendarCheckIcon,
  CertificateIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  CodeIcon,
  CogIcon,
  DashboardIcon,
  FlaskIcon,
  FolderIcon,
  GavelIcon,
  GraduationCapIcon,
  HomeIcon,
  IdCardIcon,
  InboxIcon,
  LayersIcon,
  LockIcon,
  MailIcon,
  PencilIcon,
  PeopleIcon,
  PersonIcon,
  PhoneIcon,
  PrinterIcon,
  SendIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
  TargetIcon,
  TrophyIcon,
  UploadIcon,
  UserCheckIcon,
  WalletIcon,
} from "@/shared/components/icons";
import {
  useClassMentor,
  useLibrarySettings,
  useStudent,
  useStudentAnnouncements,
  useStudentAttendanceBySemester,
  useStudentAttendanceSummary,
  useStudentBorrowRecords,
  useStudentCertificates,
  useStudentExamMarks,
  useStudentFamily,
  useStudentFeeWorkspace,
  useStudentHostelResident,
  useStudentLifecycle,
  useStudentMedicalVisits,
  useStudentPlacementHistory,
  useStudentProfileDetails,
  useStudentProjects,
  useStudentRequests,
  useStudentSubjects,
  useStudentTransport,
  useUpsertCertificate,
  useVerifyCertificate,
} from "@/modules/students/hooks/useStudents";
import { avatarTint, formatCurrency, formatDate, initials, studentName } from "@/modules/students/lib/format";
import { EditProfileModal } from "@/modules/students/components/EditProfileModal";
import { ResetPasswordModal } from "@/modules/students/components/ResetPasswordModal";
import { friendlyError } from "@/modules/admissions/wizard/shared";
import { useCertificateTypes } from "@/modules/admissions/hooks/useAdmissions";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface SectionItem {
  id: string;
  label: string;
  icon: IconComponent;
  /** Backed by a real endpoint and wired to a panel — clickable. Everything else stays disabled. */
  real?: boolean;
}

interface SectionGroup {
  group: string;
  items: SectionItem[];
}

/** Grouped exactly as the reference's `SECTIONS` in student-detail.js — same 7 groups, same 30 items, same order. */
const SECTIONS: SectionGroup[] = [
  {
    group: "Summary",
    items: [
      { id: "overview", label: "Overview", icon: DashboardIcon, real: true },
      { id: "personal", label: "Personal details", icon: PersonIcon, real: true },
      { id: "lifecycle", label: "Lifecycle", icon: LayersIcon, real: true },
    ],
  },
  {
    group: "Academics",
    items: [
      { id: "academic", label: "Academic standing", icon: GraduationCapIcon, real: true },
      { id: "attendance", label: "Attendance", icon: CalendarCheckIcon, real: true },
      { id: "subjects", label: "Subjects", icon: BookIcon, real: true },
      { id: "exams", label: "Examinations & results", icon: AwardIcon, real: true },
    ],
  },
  {
    group: "Finance",
    items: [
      { id: "fees", label: "Fees", icon: WalletIcon, real: true },
      { id: "scholarships", label: "Scholarships", icon: StarIcon },
    ],
  },
  {
    group: "Services",
    items: [
      { id: "library", label: "Library", icon: BookIcon, real: true },
      { id: "hostel", label: "Hostel", icon: HomeIcon, real: true },
      { id: "transport", label: "Transport", icon: BusIcon, real: true },
      { id: "medical", label: "Medical", icon: StethoscopeIcon, real: true },
    ],
  },
  {
    group: "People",
    items: [
      { id: "parents", label: "Parents", icon: PeopleIcon, real: true },
      { id: "guardian", label: "Guardian", icon: UserCheckIcon },
      { id: "emergency", label: "Emergency contacts", icon: PhoneIcon },
    ],
  },
  {
    group: "Records",
    items: [
      { id: "documents", label: "Documents", icon: FolderIcon },
      { id: "certificates", label: "Certificates", icon: CertificateIcon, real: true },
      { id: "identity", label: "Identity marks", icon: IdCardIcon, real: true },
    ],
  },
  {
    group: "Achievement",
    items: [
      { id: "achievements", label: "Achievements", icon: TrophyIcon },
      { id: "projects", label: "Projects", icon: CodeIcon, real: true },
      { id: "internships", label: "Internships", icon: TargetIcon },
      { id: "placements", label: "Placements", icon: BriefcaseIcon, real: true },
      { id: "research", label: "Research", icon: FlaskIcon },
    ],
  },
  {
    group: "Governance",
    items: [
      { id: "disciplinary", label: "Disciplinary", icon: GavelIcon },
      { id: "requests", label: "Requests", icon: InboxIcon, real: true },
      { id: "communications", label: "Communication", icon: MailIcon, real: true },
      { id: "activity", label: "Activity timeline", icon: ActivityIcon },
      { id: "audit", label: "Audit log", icon: ActivityIcon },
      { id: "permissions", label: "Permissions", icon: ShieldCheckIcon },
      { id: "settings", label: "Settings", icon: CogIcon },
    ],
  },
];

const NOT_BUILT_REASON = "Not built yet — sections are being wired up one at a time";
const RAIL_KEY = "erp.profileRail.collapsed";

function MetricBox({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "success" | "warning" | "danger" | "muted";
}) {
  const valueColor =
    tone === "success"
      ? "text-emerald-600"
      : tone === "warning"
        ? "text-amber-600"
        : tone === "danger"
          ? "text-red-600"
          : "text-slate-300";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${valueColor}`}>{value}</p>
      {note && <p className="mt-0.5 text-xs text-slate-400">{note}</p>}
    </div>
  );
}

function Card({ title, actions, children }: { title?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stub({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: React.ReactNode[][];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <Stub message={emptyMessage} />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map((h) => (
              <th key={h} className="px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-50 last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-2.5 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DlGrid({ pairs }: { pairs: Array<[string, string | null]> }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {pairs.map(([term, value]) => (
        <div key={term} className="min-w-0">
          <p className="mb-1 text-xs font-medium text-slate-500">{term}</p>
          <p className={value ? "text-sm text-slate-900" : "text-sm italic text-slate-400"}>
            {value || "Not recorded"}
          </p>
        </div>
      ))}
    </div>
  );
}

function ageFromDob(dob: string): string {
  const years = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return `${formatDate(dob)} (${years} years)`;
}

function PersonalPanel({
  studentId,
  active,
  name,
  email,
  phone,
}: {
  studentId: number;
  active: boolean;
  name: string;
  email: string;
  phone: string | null;
}) {
  const { data, isLoading } = useStudentProfileDetails(studentId, active);
  if (isLoading || !data) return <Stub message="Loading…" />;

  return (
    <div className="flex flex-col gap-6">
      <Card title="Identity">
        <DlGrid
          pairs={[
            ["Full name", name],
            ["Date of birth", data.date_of_birth ? ageFromDob(data.date_of_birth) : null],
            ["Gender", data.gender],
            ["Blood group", data.blood_group],
            ["Nationality", data.nationality],
            ["Mother tongue", data.mother_tongue],
            ["Religion", data.religion],
            ["Community", data.community],
            ["First graduate", data.is_first_graduate === null ? null : data.is_first_graduate ? "Yes" : "No"],
            ["Differently abled", data.is_diff_abled === null ? null : data.is_diff_abled ? "Yes" : "No"],
          ]}
        />
      </Card>
      <Card title="Contact">
        <DlGrid
          pairs={[
            ["Institutional email", email],
            ["Personal email", data.contacts?.student_email1 ?? null],
            ["Alternate email", data.contacts?.student_email2 ?? null],
            ["Institutional mobile", phone],
            ["Personal mobile", data.contacts?.student_mobile ?? null],
          ]}
        />
      </Card>
      {data.addresses.length === 0 ? (
        <Card title="Address">
          <Stub message="No address on record." />
        </Card>
      ) : (
        data.addresses.map((a) => (
          <Card key={a.address_type} title={`${a.address_type.charAt(0).toUpperCase()}${a.address_type.slice(1)} address`}>
            <DlGrid
              pairs={[
                ["Address line", a.address_line],
                ["City", a.city],
                ["State", a.state],
                ["Pincode", a.pincode],
                ["Country", "India"],
              ]}
            />
          </Card>
        ))
      )}
    </div>
  );
}

function IdentityMarksPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentProfileDetails(studentId, active);
  if (isLoading || !data) return <Stub message="Loading…" />;

  return (
    <Card title="Identity marks">
      <SimpleTable
        headers={["#", "Description"]}
        emptyMessage="No identity marks on record."
        rows={data.identity_marks.map((m) => [m.mark_number, m.description])}
      />
    </Card>
  );
}

function LifecyclePanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentLifecycle(studentId, active);
  if (isLoading || !data) return <Stub message="Loading…" />;

  const stages = [
    { label: "Application submitted", date: data.application_submitted_at, detail: data.application_status },
    { label: "Admitted", date: data.admitted_at, detail: null },
    { label: "Current standing", date: null, detail: data.current_status },
    ...(data.alumni_status ? [{ label: "Alumni", date: data.alumni_joined_at, detail: data.alumni_status }] : []),
  ];

  return (
    <Card title="Lifecycle">
      <div className="flex flex-col">
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex gap-3 pb-5 last:pb-0">
            <div className="flex flex-col items-center">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
              {i < stages.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-sm font-medium text-slate-900">{stage.label}</p>
              <p className="text-xs text-slate-500">
                {stage.date ? formatDate(stage.date) : "—"}
                {stage.detail ? ` · ${stage.detail}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AcademicPanel({
  currentSemester,
  studentId,
  active,
}: {
  currentSemester: number | null;
  studentId: number;
  active: boolean;
}) {
  const { data: subjects, isLoading } = useStudentSubjects(studentId, active);
  const totalCredits = subjects?.reduce((sum, s) => sum + (s.credits ?? 0), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricBox label="Current semester" value={currentSemester ? String(currentSemester) : "—"} tone={currentSemester ? "success" : "muted"} />
        <MetricBox
          label="Registered subjects"
          value={isLoading ? "…" : String(subjects?.length ?? 0)}
          tone={subjects?.length ? "success" : "muted"}
        />
        <MetricBox
          label="Credits this semester"
          value={isLoading ? "…" : String(totalCredits)}
          note="Sum of registered subjects — not a cumulative earned total"
          tone={totalCredits ? "success" : "muted"}
        />
      </div>
      <MetricBox label="CGPA" value="—" note="No CGPA aggregate endpoint yet" />
    </div>
  );
}

function SubjectsPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentSubjects(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;

  return (
    <Card title="Registered subjects">
      <SimpleTable
        headers={["Subject", "Code", "Credits", "Semester"]}
        emptyMessage="No subjects registered for this class."
        rows={(data ?? []).map((s) => [s.name, s.subject_code, s.credits ?? "—", s.semester])}
      />
    </Card>
  );
}

function ExamsPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentExamMarks(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;

  return (
    <Card title="Examinations & results">
      <SimpleTable
        headers={["Exam", "Subject", "Marks"]}
        emptyMessage="No exam marks recorded."
        rows={(data ?? []).map((m) => [
          `${m.exam_subject_mapping.exams.exam_types?.name ?? "Exam"} · ${m.exam_subject_mapping.exams.academic_year}`,
          `${m.exam_subject_mapping.subjects.name} (${m.exam_subject_mapping.subjects.subject_code})`,
          `${m.marks_obtained ?? "—"} / ${m.max_marks}`,
        ])}
      />
    </Card>
  );
}

function FeesPanel({ workspace, isLoading }: { workspace: import("@/modules/students/types").StudentFeeWorkspace | undefined; isLoading: boolean }) {
  if (isLoading || !workspace) return <Stub message="Loading…" />;
  const { fee_summary, demand_summary, payment_summary } = workspace;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricBox label="Total demand" value={formatCurrency(fee_summary.total_demand)} />
        <MetricBox label="Paid" value={formatCurrency(fee_summary.total_paid)} tone="success" />
        <MetricBox
          label="Outstanding"
          value={formatCurrency(fee_summary.total_outstanding)}
          tone={fee_summary.due_status === "paid" ? "success" : fee_summary.due_status === "partial" ? "warning" : "danger"}
        />
      </div>
      <Card title="Demand breakdown">
        <SimpleTable
          headers={["Fee structure", "Year / Sem", "Total", "Paid", "Outstanding", "Status"]}
          emptyMessage="No fee demand mappings for this student."
          rows={demand_summary.map((d) => [
            d.fee_structure_name,
            `${d.academic_year}${d.semester ? ` · Sem ${d.semester}` : ""}`,
            formatCurrency(d.total_amount),
            formatCurrency(d.paid_amount),
            formatCurrency(d.outstanding_amount),
            <span key="s" className="capitalize">{d.due_status}</span>,
          ])}
        />
      </Card>
      <Card title="Payment summary">
        <DlGrid
          pairs={[
            ["Payments made", String(payment_summary.payment_count)],
            ["Last payment", payment_summary.last_payment_date ? formatDate(payment_summary.last_payment_date) : null],
          ]}
        />
      </Card>
    </div>
  );
}

function LibraryPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentBorrowRecords(studentId, active);
  const { data: settings } = useLibrarySettings(active);
  if (isLoading) return <Stub message="Loading…" />;

  const records = data ?? [];
  const onLoan = records.filter((r) => r.status === "borrowed");
  const history = records.filter((r) => r.status !== "borrowed");
  const outstandingFine = records.reduce((sum, r) => sum + (r.fine_paid ? 0 : r.fine_amount), 0);
  const overdueCount = records.filter((r) => r.is_overdue).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricBox
          label="On loan"
          value={String(onLoan.length)}
          note={settings ? `of ${settings.books_per_student} permitted` : undefined}
          tone={onLoan.length > 0 ? "success" : "muted"}
        />
        <MetricBox label="Lifetime borrowed" value={String(records.length)} note="titles" tone={records.length ? "success" : "muted"} />
        <MetricBox
          label="Outstanding fine"
          value={formatCurrency(outstandingFine)}
          note={outstandingFine > 0 ? "Due" : "No dues"}
          tone={outstandingFine > 0 ? "danger" : "success"}
        />
        <MetricBox label="Overdue" value={String(overdueCount)} note="items past due" tone={overdueCount > 0 ? "danger" : "success"} />
      </div>

      <Card title="Current loans">
        <SimpleTable
          headers={["Accession", "Title", "Issued", "Due", "Status"]}
          emptyMessage="No books currently on loan."
          rows={onLoan.map((r) => [
            <span key="a" className="font-mono text-xs">{r.book.qr_code}</span>,
            r.book.title,
            formatDate(r.borrowed_date),
            formatDate(r.due_date),
            <span key="s" className={r.is_overdue ? "font-medium text-red-600" : "text-blue-700"}>
              {r.is_overdue ? `Overdue (${r.days_overdue}d)` : "On loan"}
            </span>,
          ])}
        />
      </Card>

      <Card title="Borrowing history">
        <SimpleTable
          headers={["Accession", "Title", "Issued", "Returned", "Fine"]}
          emptyMessage="No past borrow records."
          rows={history.map((r) => [
            <span key="a" className="font-mono text-xs">{r.book.qr_code}</span>,
            r.book.title,
            formatDate(r.borrowed_date),
            r.returned_date ? formatDate(r.returned_date) : "—",
            r.fine_amount > 0 ? formatCurrency(r.fine_amount) : "—",
          ])}
        />
      </Card>
    </div>
  );
}

function HostelPanel({ studentType, studentId, active }: { studentType: "hosteller" | "dayscholar"; studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentHostelResident(studentId, active);

  if (studentType !== "hosteller") {
    return <Stub message="Day scholar — no hostel residency." />;
  }
  if (isLoading) return <Stub message="Loading…" />;
  if (!data) {
    return <Stub message="Marked as hosteller, but no active room assignment found." />;
  }

  return (
    <Card title="Hostel residency">
      <DlGrid
        pairs={[
          ["Hostel", data.hostel ? `${data.hostel.name} (${data.hostel.code})` : null],
          ["Room", data.room?.room_number ?? null],
          ["Sharing", data.sharing],
          ["Fee status", data.fee_status.replace("_", " ")],
          ["Allocated on", data.allocated_date ? formatDate(data.allocated_date) : null],
          ["Current status", data.current_status.replace("_", " ")],
        ]}
      />
    </Card>
  );
}

function ParentsPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentFamily(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;
  if (!data) return <Stub message="No family details on record." />;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Card title="Father">
        <DlGrid
          pairs={[
            ["Name", data.father_name],
            ["Qualification", data.father_qualification],
            ["Occupation", data.father_occupation],
            ["Annual income", data.father_annual_income],
            ["Email", data.father_email],
            ["Mobile", data.father_mobile],
          ]}
        />
      </Card>
      <Card title="Mother">
        <DlGrid
          pairs={[
            ["Name", data.mother_name],
            ["Qualification", data.mother_qualification],
            ["Occupation", data.mother_occupation],
            ["Annual income", data.mother_annual_income],
            ["Email", data.mother_email],
            ["Mobile", data.mother_mobile],
          ]}
        />
      </Card>
    </div>
  );
}

function PlacementsPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentPlacementHistory(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;

  return (
    <Card title="Placement drive history">
      <SimpleTable
        headers={["Company", "Scheduled", "Drive status", "Application status"]}
        emptyMessage="No placement drive applications on record."
        rows={(data ?? []).map((p) => [
          p.company_name,
          formatDate(p.scheduled_date),
          <span key="d" className="capitalize">{p.drive_status}</span>,
          <span key="a" className="capitalize">{p.application_status}</span>,
        ])}
      />
    </Card>
  );
}

function ProjectsPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentProjects(studentId, active);
  if (isLoading || !data) return <Stub message="Loading…" />;

  const links: Array<[string, string | null]> = [
    ["Resume", data.profile?.resume_url ?? null],
    ["LinkedIn", data.profile?.linkedin_url ?? null],
    ["GitHub", data.profile?.github_url ?? null],
    ["LeetCode", data.profile?.leetcode_url ?? null],
    ["HackerRank", data.profile?.hackerrank_url ?? null],
    ["Codeforces", data.profile?.codeforces_url ?? null],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card title="Profile links">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {links.map(([label, url]) => (
            <div key={label} className="min-w-0">
              <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
              {url ? (
                <a href={url} target="_blank" rel="noreferrer" className="truncate text-sm text-blue-700 hover:underline">
                  {url}
                </a>
              ) : (
                <p className="text-sm italic text-slate-400">Not recorded</p>
              )}
            </div>
          ))}
        </div>
      </Card>
      <Card title="Projects">
        <SimpleTable
          headers={["Title", "Description", "Mentor"]}
          emptyMessage="No projects on record."
          rows={data.projects.map((p) => [
            p.title,
            p.description ?? "—",
            p.faculty ? `${p.faculty.first_name} ${p.faculty.last_name}` : "—",
          ])}
        />
      </Card>
    </div>
  );
}

function AttendancePanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentAttendanceSummary(studentId, active);
  if (isLoading || !data) return <Stub message="Loading…" />;

  const tone = data.overall.percentage >= 75 ? "success" : "danger";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricBox label="Overall" value={`${data.overall.percentage}%`} tone={tone} />
        <MetricBox label="Present" value={String(data.overall.present)} note={`of ${data.overall.total_days} sessions`} />
        <MetricBox label="Absent" value={String(data.overall.absent)} tone={data.overall.absent > 0 ? "warning" : "success"} />
        <MetricBox label="Sessions on file" value={String(data.overall.total_days)} />
      </div>
      <Card title="By subject">
        <SimpleTable
          headers={["Subject", "Present", "Total", "Percentage"]}
          emptyMessage="No subject-tagged sessions on record."
          rows={data.by_subject.map((s) => [s.subject_name, s.present, s.total, `${s.percentage}%`])}
        />
      </Card>
      <SemesterAttendanceView studentId={studentId} active={active} />
    </div>
  );
}

function AttendanceMark({ status }: { status: "present" | "absent" }) {
  if (status === "present") {
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-400">
        P
      </span>
    );
  }
  return (
    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-danger text-[11px] font-semibold text-white">
      A
    </span>
  );
}

const MONTH_LABEL_FORMAT = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

function monthLabel(dateStr: string) {
  return MONTH_LABEL_FORMAT.format(new Date(`${dateStr}T00:00:00Z`));
}

/** Groups a term's days by month, collapsible per month, defaulting to only the most recent month open. Remounted
    (via `key={term.semester}` at the call site) whenever the selected semester changes, so this state resets cleanly. */
function DayRegister({ term }: { term: import("@/modules/students/types").StudentAttendanceTerm }) {
  const usesPeriods = term.periods.length > 0;
  const columns = usesPeriods
    ? term.periods.map((p) => `Period ${p}`)
    : Array.from(new Set(term.days.flatMap((d) => d.subjects.map((s) => s.subject_name))));

  const months = Array.from(new Set(term.days.map((d) => monthKey(d.date))));
  const [openMonths, setOpenMonths] = useState<Set<string>>(() => new Set(months.slice(-1)));

  function toggleMonth(key: string) {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (term.days.length === 0) {
    return <Stub message={`No sessions recorded in Semester ${term.semester}.`} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {months.map((month) => {
        const isOpen = openMonths.has(month);
        const monthDays = term.days.filter((d) => monthKey(d.date) === month);
        const monthLost = monthDays.reduce((sum, d) => sum + d.lost, 0);

        return (
          <div key={month} className="overflow-hidden rounded-lg border border-slate-100">
            <button
              type="button"
              onClick={() => toggleMonth(month)}
              className="flex w-full items-center justify-between bg-slate-50 px-3 py-2 text-left"
            >
              <span className="text-sm font-medium text-slate-700">{monthLabel(monthDays[0].date)}</span>
              <span className="flex items-center gap-3 text-xs text-slate-400">
                {monthDays.length} days{monthLost > 0 ? ` · ${monthLost} lost` : ""}
                <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            {isOpen && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="sticky left-0 z-10 bg-white px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Date
                      </th>
                      {columns.map((name) => (
                        <th key={name} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400" title={name}>
                          {name}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">Lost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthDays.map((day) => (
                      <tr key={day.date} className={`border-b border-slate-50 last:border-b-0 ${day.lost > 0 ? "bg-blue-50/50" : ""}`}>
                        <td className="sticky left-0 z-10 bg-inherit px-2 py-2 font-medium text-slate-700">{formatDate(day.date)}</td>
                        {usesPeriods
                          ? day.period_marks.map((mark) => (
                              <td key={mark.period_number} className="px-2 py-2 text-center" title={mark.subject_name ?? undefined}>
                                {mark.status ? <AttendanceMark status={mark.status} /> : <span className="text-slate-300">—</span>}
                              </td>
                            ))
                          : columns.map((name) => {
                              const subject = day.subjects.find((s) => s.subject_name === name);
                              return (
                                <td key={name} className="px-2 py-2 text-center">
                                  {subject ? <AttendanceMark status={subject.status} /> : <span className="text-slate-300">—</span>}
                                </td>
                              );
                            })}
                        <td className="px-2 py-2 text-center font-medium text-slate-700">
                          {day.lost > 0 ? day.lost : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


/** Master (semester summary) → detail (day register + absence list) — mirrors the reference's semesterAttendanceView().
    The day register uses real timetable periods when the class has a configured timetable (period columns, exactly
    like the reference), falling back to subject columns when it doesn't — attendance_records itself has no
    period-of-day column, so period-level marks are derived by joining to timetable_slots server-side. */
function SemesterAttendanceView({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentAttendanceBySemester(studentId, active);
  const [selected, setSelected] = useState(0);

  if (isLoading) return <Stub message="Loading…" />;
  if (!data || data.length === 0) {
    return (
      <Card title="Attendance by semester">
        <Stub message="No academic-calendar terms on record for this student's batch — semester boundaries aren't set up yet." />
      </Card>
    );
  }

  const index = Math.min(selected, data.length - 1);
  const term = data[index];

  return (
    <div className="flex flex-col gap-6">
      <Card title="Attendance by semester" actions={<span className="text-xs text-slate-400">Select a term to see its register and absences</span>}>
        <SimpleTable
          headers={["Semester", "Days", "Present", "Absent", "Attendance"]}
          emptyMessage="No terms on record."
          rows={data.map((t, i) => [
            <button
              key="sem"
              type="button"
              onClick={() => setSelected(i)}
              className={`text-left font-medium ${i === index ? "text-blue-700" : "text-slate-700 hover:text-blue-700"}`}
            >
              Semester {t.semester}
              <span className="block text-xs font-normal text-slate-400">
                {formatDate(t.from)} – {formatDate(t.to)}
              </span>
            </button>,
            t.working_days,
            t.present,
            t.absent,
            <span key="p" className={t.percentage >= 75 ? "text-emerald-600" : "font-medium text-red-600"}>
              {t.percentage}%
            </span>,
          ])}
        />
      </Card>

      <Card
        title="Day-by-day register"
        actions={
          <span className="text-xs text-slate-400">
            {term.working_days} working days{term.periods.length > 0 ? ` · ${term.periods.length} periods/day` : ""}
          </span>
        }
      >
        <DayRegister key={term.semester} term={term} />
      </Card>

      <Card title="Absence history">
        <SimpleTable
          headers={["Date", "Missed", "Lost", "Cumulative"]}
          emptyMessage={`Full attendance — no periods were missed in Semester ${term.semester}.`}
          rows={term.absences.map((a) => [formatDate(a.date), a.subjects_missed.join(", "), a.lost, a.running_total])}
        />
      </Card>
    </div>
  );
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  leave: "Leave",
  outing: "Hostel outing",
  bonafide: "Bonafide certificate",
  od: "On-duty",
};

function RequestsPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentRequests(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;

  return (
    <Card title="Requests" actions={<span className="text-xs text-slate-400">Leave · Outing · Bonafide · On-duty</span>}>
      <SimpleTable
        headers={["Type", "Dates", "Detail", "Status", "Submitted"]}
        emptyMessage="No requests on record across leave, outing, bonafide, or on-duty."
        rows={(data ?? []).map((r) => [
          REQUEST_TYPE_LABELS[r.type] ?? r.type,
          r.from_date ? `${formatDate(r.from_date)} – ${formatDate(r.to_date)}` : "—",
          r.detail ?? "—",
          <span key="s" className="capitalize">{r.status.replace(/_/g, " ")}</span>,
          formatDate(r.created_at),
        ])}
      />
    </Card>
  );
}

function CommunicationsPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentAnnouncements(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;

  if (!data || data.length === 0) {
    return <Stub message="No announcements targeted at this student's class." />;
  }

  return (
    <div className="flex flex-col gap-4">
      {data.map((a) => (
        <Card key={a.id} title={a.title} actions={<span className="text-xs text-slate-400">{formatDate(a.created_at)}</span>}>
          <p className="text-sm text-slate-700">{a.content}</p>
        </Card>
      ))}
    </div>
  );
}

/**
 * Merges the real, DB-backed certificate_types list with whatever rows
 * already exist for this student, so every type is always shown (even one
 * nobody has touched yet) — same "checklist over records" idea as the
 * wizard's own CertificateChecklistPanel, just for a student who's already
 * past admission.
 */
function CertificatesPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { show } = useToast();
  const { data: certificateTypes, isLoading: typesLoading } = useCertificateTypes(active);
  const { data: certificates, isLoading: recordsLoading } = useStudentCertificates(studentId, active);
  const upsert = useUpsertCertificate();
  const verify = useVerifyCertificate();
  const [pendingTypeId, setPendingTypeId] = useState<number | null>(null);

  if (typesLoading || recordsLoading) return <Stub message="Loading…" />;
  if (!certificateTypes?.length) return <Stub message="No certificate types are configured yet." />;

  const byTypeId = new Map((certificates ?? []).map((c) => [c.certificate_type_id, c]));

  async function handleToggleAvailable(typeId: number, isAvailable: boolean) {
    setPendingTypeId(typeId);
    try {
      await upsert.mutateAsync({ student_id: studentId, certificate_type_id: typeId, is_available: isAvailable });
    } catch (err) {
      show(friendlyError(err), "error");
    } finally {
      setPendingTypeId(null);
    }
  }

  async function handleFile(typeId: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPendingTypeId(typeId);
    try {
      await upsert.mutateAsync({ student_id: studentId, certificate_type_id: typeId, file });
      show("Attached.", "success");
    } catch (err) {
      show(friendlyError(err), "error");
    } finally {
      setPendingTypeId(null);
    }
  }

  async function handleVerifyToggle(certificateId: number, currentlyVerified: boolean) {
    setPendingTypeId(certificateId);
    try {
      await verify.mutateAsync({ certificateId, verified: !currentlyVerified, studentId });
    } catch (err) {
      show(friendlyError(err), "error");
    } finally {
      setPendingTypeId(null);
    }
  }

  return (
    <Card
      title="Certificates"
      actions={<span className="text-xs text-slate-400">The originals collected at admission</span>}
    >
      <div className="flex flex-col divide-y divide-slate-100">
        {certificateTypes.map((type) => {
          const record = byTypeId.get(type.id);
          const isAvailable = record?.is_available ?? false;
          const isPending = pendingTypeId === type.id || pendingTypeId === record?.id;
          return (
            <div key={type.id} className="flex flex-wrap items-center gap-3 py-3">
              <label className="flex flex-1 items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  disabled={isPending}
                  onChange={(e) => handleToggleAvailable(type.id, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500 disabled:cursor-not-allowed"
                />
                {type.name}
              </label>

              {record?.file_url && (
                <a
                  href={record.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-blue-700 hover:underline"
                >
                  View
                </a>
              )}

              {record?.file_url && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleVerifyToggle(record.id, !!record.verified_at)}
                  title={record.verified_at ? `Verified ${formatDate(record.verified_at)} — click to un-verify` : "Mark as verified against the original"}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                    record.verified_at ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {record.verified_at ? <CheckIcon className="h-3 w-3" /> : null}
                  {record.verified_at ? "Verified" : "Not verified"}
                </button>
              )}

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  disabled={isPending}
                  onChange={(e) => handleFile(type.id, e)}
                />
                <span className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  <UploadIcon className="h-3.5 w-3.5" /> {record?.file_url ? "Replace" : "Attach"}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TransportPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentTransport(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;
  if (!data) return <Stub message="No transport mapping for this student — likely not using college transport." />;

  return (
    <Card title="Transport">
      <DlGrid
        pairs={[
          ["Route", data.route?.name ?? null],
          ["Boarding stage", data.boarding_stage?.stage_name ?? null],
          ["Destination stage", data.destination_stage?.stage_name ?? null],
          ["Stage fee", data.boarding_stage ? formatCurrency(data.boarding_stage.fee_amount) : null],
        ]}
      />
    </Card>
  );
}

function MedicalPanel({ studentId, active }: { studentId: number; active: boolean }) {
  const { data, isLoading } = useStudentMedicalVisits(studentId, active);
  if (isLoading) return <Stub message="Loading…" />;

  return (
    <Card title="Medical visits" actions={<span className="text-xs text-slate-400">College health centre</span>}>
      <SimpleTable
        headers={["Date", "Reason", "Diagnosis", "Treatment", "Attended by", "Referred out"]}
        emptyMessage="No medical centre visits on record."
        rows={(data ?? []).map((v) => [
          formatDate(v.visit_date),
          v.reason ?? "—",
          v.diagnosis ?? "—",
          v.treatment_given ?? "—",
          v.attended_by ? `${v.attended_by.name}${v.attended_by.designation ? ` (${v.attended_by.designation})` : ""}` : "—",
          v.referred_to_hospital ? (
            <span key="r" className="font-medium text-amber-600">Yes</span>
          ) : (
            "No"
          ),
        ])}
      />
    </Card>
  );
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const studentId = Number(params.id);

  const { data: student, isLoading, error } = useStudent(studentId);
  const { data: feeWorkspace } = useStudentFeeWorkspace(studentId);
  const { data: mentor } = useClassMentor(student?.class?.id);
  const { data: attendanceSummary } = useStudentAttendanceSummary(studentId, true);
  const { data: overviewSubjects } = useStudentSubjects(studentId, true);
  const { data: overviewCertificateTypes } = useCertificateTypes(true);
  const { data: overviewCertificates } = useStudentCertificates(studentId, true);

  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [railCollapsed, setRailCollapsed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem(RAIL_KEY) === "1",
  );

  function toggleRail() {
    setRailCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(RAIL_KEY, next ? "1" : "0");
      } catch {
        /* non-fatal */
      }
      return next;
    });
  }

  if (isLoading) {
    return <div className="p-2 text-sm text-slate-500">Loading student…</div>;
  }
  if (error || !student) {
    return <div className="p-2 text-sm text-red-600">Student not found.</div>;
  }

  const tint = avatarTint(student.id);
  const name = studentName(student.first_name, student.last_name);
  const residence = student.student_type === "hosteller" ? "Hosteller" : "Day scholar";

  const fee = feeWorkspace?.fee_summary;
  const feeTone = !fee ? undefined : fee.due_status === "paid" ? "success" : fee.due_status === "partial" ? "warning" : "danger";

  return (
    <div className="flex flex-col gap-5">
      {/* ---- Breadcrumb + back ---- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-700">
            Home
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <Link href="/admin/students" className="hover:text-slate-700">
            Students
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-700">{name}</span>
        </nav>
        <Link href="/admin/students" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">
          <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to list
        </Link>
      </div>

      {/* ---- Identity header ---- */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start gap-5">
          <div className="relative h-[92px] w-[92px] shrink-0">
            <span
              className="flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 text-2xl font-semibold"
              style={student.photo_url ? undefined : { background: tint.bg, color: tint.fg }}
            >
              {student.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- a Supabase Storage URL, not a local/optimizable asset
                <img src={student.photo_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                initials(student.first_name, student.last_name)
              )}
            </span>
          </div>

          <div className="min-w-[280px] flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{name}</h1>
              <StatusPill tone={student.status === "active" ? "green" : "slate"}>
                {student.status === "active" ? "Active" : "Inactive"}
              </StatusPill>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {student.course?.name ?? "—"} {student.department?.name ?? ""} · Section {student.class?.section ?? "—"} · Batch{" "}
              {student.batch?.name ?? "—"}
            </p>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <IdItem label="Roll number" value={student.roll_no ?? student.student_id_no} />
              <IdItem label="Register number" value={student.register_no ?? "—"} />
              <IdItem label="Student ID" value={student.student_id_no} />
              <IdItem label="Admitted" value={formatDate(student.admission_date)} />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <PencilIcon className="h-4 w-4" /> Edit profile
          </Button>
          <Button variant="secondary" onClick={() => setResetPasswordOpen(true)}>
            <LockIcon className="h-4 w-4" /> Reset password
          </Button>
          <Button variant="secondary" disabled title="Timeline — no per-student activity endpoint yet">
            <ActivityIcon className="h-4 w-4" /> Timeline
          </Button>
          <Button variant="secondary" disabled title="Academic history — needs the Academics sections built out">
            <GraduationCapIcon className="h-4 w-4" /> Academic history
          </Button>
          <Button variant="secondary" disabled title="Notify — no messaging backend yet">
            <SendIcon className="h-4 w-4" /> Notify
          </Button>
          <Button variant="secondary" disabled title="ID card — no ID card module yet">
            <IdCardIcon className="h-4 w-4" /> ID card
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <PrinterIcon className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* ---- Lifecycle strip ---- */}
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Student lifecycle</span>
          <span className="text-xs text-slate-400" title="Lifecycle stages aren't tracked as per-student data yet — only status (active/inactive) and admission date exist">
            Not tracked — only status and admission date exist today
          </span>
        </div>
      </div>

      {/* ---- Rail + panels ---- */}
      <div className={`grid items-start gap-6 ${railCollapsed ? "grid-cols-[64px_minmax(0,1fr)]" : "grid-cols-[232px_minmax(0,1fr)]"}`}>
        <nav className="sticky top-0 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white" aria-label="Profile sections">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
            {!railCollapsed && <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sections</span>}
            <button
              type="button"
              onClick={toggleRail}
              aria-label={railCollapsed ? "Expand section list" : "Collapse section list"}
              className="ml-auto rounded-sm p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              {railCollapsed ? <ChevronsRightIcon className="h-3.5 w-3.5" /> : <ChevronsLeftIcon className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="flex flex-col gap-0.5 p-2">
            {SECTIONS.map((group) => (
              <div key={group.group}>
                {!railCollapsed && (
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.group}</div>
                )}
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!item.real}
                      title={item.real ? item.label : `${item.label} — ${NOT_BUILT_REASON}`}
                      onClick={() => item.real && setActiveTab(item.id)}
                      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        !item.real
                          ? "cursor-not-allowed text-slate-300"
                          : isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <item.icon className="h-[15px] w-[15px] shrink-0 opacity-75" />
                      {!railCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <MetricBox
                  label="Attendance"
                  value={attendanceSummary ? `${attendanceSummary.overall.percentage}%` : "—"}
                  note={attendanceSummary ? `${attendanceSummary.overall.present} of ${attendanceSummary.overall.total_days} sessions` : "Loading…"}
                  tone={!attendanceSummary ? undefined : attendanceSummary.overall.percentage >= 75 ? "success" : "danger"}
                />
                <MetricBox label="CGPA" value="—" note="No marks/grades aggregate yet" />
                <MetricBox
                  label="Credits"
                  value={overviewSubjects ? String(overviewSubjects.reduce((sum, s) => sum + (s.credits ?? 0), 0)) : "—"}
                  note="This semester's registered subjects"
                  tone={overviewSubjects?.length ? "success" : "muted"}
                />
                <MetricBox label="Arrears" value="—" note="No arrears aggregate yet" />
                <MetricBox
                  label="Fee status"
                  value={fee ? formatCurrency(fee.total_paid) : "—"}
                  note={fee ? (Number(fee.total_outstanding) > 0 ? `${formatCurrency(fee.total_outstanding)} outstanding` : "Fully settled") : "Loading…"}
                  tone={feeTone}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="flex flex-col gap-6">
                  <Card title="At a glance">
                    <DlGrid
                      pairs={[
                        ["Programme", student.course?.name ?? null],
                        ["Department", student.department?.name ?? null],
                        ["Section", student.class?.section ? `Section ${student.class.section}` : null],
                        ["Batch", student.batch?.name ?? null],
                        ["Admission quota", student.quota?.name ?? null],
                        ["Residence", residence],
                        ["Admission date", student.admission_date ? formatDate(student.admission_date) : null],
                        ["Semester / Year", student.class?.current_semester ? `Semester ${student.class.current_semester}` : null],
                        ["Admission type", null],
                        [
                          "Class advisor",
                          mentor ? `${mentor.faculty.first_name} ${mentor.faculty.last_name}` : null,
                        ],
                        ["Expected graduation", null],
                      ]}
                    />
                  </Card>

                  <Card title="Attendance trend" actions={<span className="text-xs text-slate-400">Last 7 months</span>}>
                    <Stub message="No monthly attendance aggregate endpoint yet — only raw per-session records exist." />
                  </Card>

                  <Card title="Recent activity">
                    <Stub message="Not available — no activity feed exists yet." />
                  </Card>
                </div>

                <div className="flex flex-col gap-6">
                  <Card title="Attention required">
                    {fee && fee.due_status !== "paid" && Number(fee.total_outstanding) > 0 ? (
                      <div
                        className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                          fee.due_status === "pending" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        <WalletIcon className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-semibold">Fees outstanding</p>
                          <p className="mt-0.5">{formatCurrency(fee.total_outstanding)} due.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No alerts.</p>
                    )}
                  </Card>

                  <Card title="Photo & documents">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Photo</span>
                        {student.photo_url ? (
                          <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                            <CheckIcon className="h-3.5 w-3.5" />
                            Uploaded{student.photo_uploaded_at ? ` · ${formatDate(student.photo_uploaded_at)}` : ""}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not uploaded</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Documents</span>
                        {overviewCertificateTypes && overviewCertificates ? (
                          (() => {
                            const collected = overviewCertificates.filter((c) => c.is_available).length;
                            const verified = overviewCertificates.filter((c) => c.verified_at).length;
                            return (
                              <span className="font-medium text-slate-700">
                                {collected} of {overviewCertificateTypes.length} collected
                                {verified > 0 ? ` · ${verified} verified` : ""}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-slate-400">Loading…</span>
                        )}
                      </div>
                    </div>
                  </Card>

                  <Card title="Class advisor">
                    {mentor ? (
                      <div className="flex items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                          style={{ background: tint.bg, color: tint.fg }}
                        >
                          {initials(mentor.faculty.first_name, mentor.faculty.last_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {mentor.faculty.first_name} {mentor.faculty.last_name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {mentor.faculty.designation ?? "Faculty"} · {mentor.academic_year}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No mentor assigned for this class.</p>
                    )}
                  </Card>

                  <Card title="Open requests">
                    <Stub message="No unified student-requests endpoint exists yet." />
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === "personal" && (
            <PersonalPanel
              studentId={studentId}
              active={activeTab === "personal"}
              name={name}
              email={student.email}
              phone={student.phone}
            />
          )}
          {activeTab === "identity" && <IdentityMarksPanel studentId={studentId} active={activeTab === "identity"} />}
          {activeTab === "lifecycle" && <LifecyclePanel studentId={studentId} active={activeTab === "lifecycle"} />}
          {activeTab === "academic" && (
            <AcademicPanel
              currentSemester={student.class?.current_semester ?? null}
              studentId={studentId}
              active={activeTab === "academic"}
            />
          )}
          {activeTab === "attendance" && <AttendancePanel studentId={studentId} active={activeTab === "attendance"} />}
          {activeTab === "subjects" && <SubjectsPanel studentId={studentId} active={activeTab === "subjects"} />}
          {activeTab === "exams" && <ExamsPanel studentId={studentId} active={activeTab === "exams"} />}
          {activeTab === "fees" && <FeesPanel workspace={feeWorkspace} isLoading={!feeWorkspace} />}
          {activeTab === "library" && <LibraryPanel studentId={studentId} active={activeTab === "library"} />}
          {activeTab === "hostel" && (
            <HostelPanel studentType={student.student_type} studentId={studentId} active={activeTab === "hostel"} />
          )}
          {activeTab === "transport" && <TransportPanel studentId={studentId} active={activeTab === "transport"} />}
          {activeTab === "medical" && <MedicalPanel studentId={studentId} active={activeTab === "medical"} />}
          {activeTab === "parents" && <ParentsPanel studentId={studentId} active={activeTab === "parents"} />}
          {activeTab === "certificates" && <CertificatesPanel studentId={studentId} active={activeTab === "certificates"} />}
          {activeTab === "placements" && <PlacementsPanel studentId={studentId} active={activeTab === "placements"} />}
          {activeTab === "projects" && <ProjectsPanel studentId={studentId} active={activeTab === "projects"} />}
          {activeTab === "requests" && <RequestsPanel studentId={studentId} active={activeTab === "requests"} />}
          {activeTab === "communications" && (
            <CommunicationsPanel studentId={studentId} active={activeTab === "communications"} />
          )}
        </div>
      </div>

      <EditProfileModal
        studentId={studentId}
        firstName={student.first_name}
        lastName={student.last_name}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
      <ResetPasswordModal
        studentId={studentId}
        studentName={name}
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      />
    </div>
  );
}

function IdItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 font-mono text-sm text-slate-900">{value}</p>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import {
  ActivityIcon,
  BriefcaseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ClipboardIcon,
  DashboardIcon,
  DownloadIcon,
  FolderIcon,
  MapPinIcon,
  PencilIcon,
  PersonIcon,
  ShieldIcon,
  TrashIcon,
} from "@/shared/components/icons";
import type { SVGProps } from "react";
import { useFacultyById } from "@/modules/faculty/hooks/useFacultyById";
import { useFacultyMappings } from "@/modules/faculty/hooks/useFacultyMappings";
import { useFacultyDocuments } from "@/modules/faculty/hooks/useFacultyDocuments";
import { useFacultyActivity } from "@/modules/faculty/hooks/useFacultyActivity";
import { useFacultyAttendance } from "@/modules/faculty/hooks/useFacultyAttendance";
import {
  useDeleteFacultyDocument,
  useUploadFacultyDocument,
} from "@/modules/faculty/hooks/useFacultyFileMutations";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { FacultyIdCardModal } from "@/modules/faculty/components/FacultyIdCardModal";
import {
  experienceYears,
  formatDate,
  formatFacultyCode,
  fullName,
  maskTail,
  profileCompleteness,
} from "@/modules/faculty/lib/faculty-format";
import { classLabel, subjectLabel } from "@/modules/faculty/lib/faculty-mapping-format";
import {
  DOCUMENT_TYPE_OPTIONS,
  EMPLOYEE_TYPE_FROM_ENUM,
  EMPLOYMENT_STATUS_FROM_ENUM,
  QUALIFICATION_DOCUMENT_TYPE_OPTIONS,
} from "@/modules/faculty/lib/faculty-wizard-config";

const ALL_DOCUMENT_TYPE_OPTIONS = Array.from(
  new Set([...DOCUMENT_TYPE_OPTIONS, ...QUALIFICATION_DOCUMENT_TYPE_OPTIONS]),
);

// Mirrors the backend's ALLOWED_DOCUMENT_MIME_TYPES/MAX_DOCUMENT_BYTES
// (faculty-files.service.ts) — checked client-side too so the admin gets a
// clear message immediately instead of only after a failed upload.
const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const DOCUMENT_FORMAT_HINT = "PDF, JPG, or PNG · up to 10 MB";

interface SectionItem {
  id: string;
  label: string;
  soon?: boolean;
  icon?: React.ComponentType<SVGProps<SVGSVGElement>>;
}
interface SectionGroup {
  label: string;
  items: SectionItem[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    label: "Profile",
    items: [
      { id: "overview", label: "Overview", icon: DashboardIcon },
      { id: "personal", label: "Personal Information", icon: PersonIcon },
      { id: "contact", label: "Contact", icon: MapPinIcon },
      { id: "employment", label: "Employment", icon: BriefcaseIcon },
      { id: "identity", label: "Identity", icon: ShieldIcon },
      { id: "documents", label: "Documents", icon: FolderIcon },
    ],
  },
  {
    label: "Academics",
    items: [
      { id: "academic-assignments", label: "Academic Assignments", icon: ClipboardIcon },
      { id: "attendance", label: "Attendance" },
    ],
  },
  {
    label: "Records",
    items: [{ id: "activity", label: "Activity", icon: ActivityIcon }],
  },
];

function InfoGrid({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

const MINI_STAT_TONE_BARS: Record<string, string> = {
  green: "bg-green-400",
  amber: "bg-amber-400",
  red: "bg-red-400",
  blue: "bg-blue-300",
};

function MiniStat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "green" | "amber" | "red" | "blue";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {tone && <span className={`h-1.5 w-5 rounded-full ${MINI_STAT_TONE_BARS[tone]}`} />}
      </div>
      <p className="text-xs text-slate-500">{caption}</p>
    </div>
  );
}

const ATTENDANCE_STATUS_STYLES: Record<string, { label: string; tone: PillTone }> = {
  full_day: { label: "Full Day", tone: "green" },
  half_day: { label: "Half Day", tone: "amber" },
  absent: { label: "Absent", tone: "red" },
  on_duty: { label: "On Duty", tone: "blue" },
  on_leave: { label: "On Leave", tone: "blue" },
  on_vacation: { label: "On Vacation", tone: "blue" },
  weekly_off: { label: "Weekly Off", tone: "slate" },
  holiday: { label: "Holiday", tone: "slate" },
};

function formatDayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function ProfileCompletionRing({ percent }: { percent: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-base font-bold text-slate-900">{percent}%</span>
      </div>
    </div>
  );
}

export default function FacultyDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const facultyId = Number(params.id);
  const { show } = useToast();

  const { data: faculty, isLoading, error } = useFacultyById(Number.isFinite(facultyId) ? facultyId : null);

  // Called unconditionally (before the early returns below) since hooks
  // can't be conditional — enabled internally once facultyId resolves.
  const { data: mappingsData, isLoading: mappingsLoading } = useFacultyMappings({
    faculty_id: Number.isFinite(facultyId) ? facultyId : undefined,
    limit: 100,
  });
  const validFacultyId = Number.isFinite(facultyId) ? facultyId : null;
  const { data: documents, isLoading: documentsLoading } = useFacultyDocuments(validFacultyId);
  const { data: activity, isLoading: activityLoading } = useFacultyActivity(validFacultyId);
  const { data: attendance, isLoading: attendanceLoading } = useFacultyAttendance(validFacultyId);
  const uploadDocument = useUploadFacultyDocument(facultyId);
  const deleteDocument = useDeleteFacultyDocument(facultyId);

  const [activeSection, setActiveSection] = useState(() => searchParams.get("section") ?? "overview");
  const [sectionsCollapsed, setSectionsCollapsed] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string> | null>(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);
  const [newDocType, setNewDocType] = useState("");
  const [selectedDocFileName, setSelectedDocFileName] = useState<string | null>(null);
  const docUploadRef = useRef<HTMLInputElement>(null);

  const completeness = useMemo(() => (faculty ? profileCompleteness(faculty) : 0), [faculty]);

  const mappings = useMemo(() => mappingsData?.data ?? [], [mappingsData]);
  const distinctSubjectCount = useMemo(() => new Set(mappings.map((m) => m.subject.id)).size, [mappings]);
  const distinctClassCount = useMemo(() => new Set(mappings.map((m) => m.class.id)).size, [mappings]);

  function handleUploadDocument() {
    const file = docUploadRef.current?.files?.[0];
    if (!newDocType || !file) {
      show("Choose a document type and a file first.", "error");
      return;
    }
    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) {
      show(`That file type isn't supported. Please upload a ${DOCUMENT_FORMAT_HINT} file.`, "error");
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      show(`That file is too large. Please upload a file ${DOCUMENT_FORMAT_HINT}.`, "error");
      return;
    }
    uploadDocument.mutate(
      { file, documentType: newDocType },
      {
        onSuccess: () => {
          show("Document uploaded.", "success");
          setNewDocType("");
          setSelectedDocFileName(null);
          if (docUploadRef.current) docUploadRef.current.value = "";
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Couldn't upload the document.", "error");
        },
      },
    );
  }

  function handleDeleteDocument(documentId: number) {
    deleteDocument.mutate(documentId, {
      onSuccess: () => show("Document removed.", "success"),
      onError: (err: unknown) => {
        show(err instanceof ApiError ? err.message : "Couldn't remove the document.", "error");
      },
    });
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading faculty…</p>;
  }

  if (error || !faculty) {
    return (
      <p className="text-sm text-red-600">
        {error instanceof ApiError ? error.message : "Couldn't load this faculty record."}
      </p>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <nav className="text-sm text-slate-500">
          <Link href="/admin" className="hover:text-slate-700">
            Home
          </Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/faculty" className="hover:text-slate-700">
            Faculty
          </Link>
          <span className="mx-1.5">›</span>
          <span className="font-medium text-slate-700">{fullName(faculty)}</span>
        </nav>
        <Link href="/admin/faculty" className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ChevronLeftIcon className="h-4 w-4" /> Back to list
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          {faculty.profile_url ? (
            <button
              type="button"
              onClick={() => setPhotoViewerOpen(true)}
              aria-label="View profile photo"
              className="mt-1 block shrink-0 cursor-pointer border-0 bg-transparent p-0 leading-none"
            >
              <FacultyAvatar faculty={faculty} className="h-[92px] w-[92px] rounded-xl text-2xl" />
            </button>
          ) : (
            <FacultyAvatar faculty={faculty} className="mt-1 h-[92px] w-[92px] rounded-xl text-2xl" />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{fullName(faculty)}</h1>
              <StatusPill tone={faculty.status === "active" ? "green" : "slate"}>
                {faculty.status === "active" ? "Active" : "Inactive"}
              </StatusPill>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {faculty.designation} · {faculty.department?.name ?? "No department"}
            </p>

            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs">
              {[
                ["Faculty ID", formatFacultyCode(faculty.id)],
                ["Department", faculty.department?.code ?? faculty.department?.name ?? "—"],
                ["Email", faculty.email],
                ["Phone", faculty.phone ?? "Not provided"],
                ["Joined", formatDate(faculty.date_of_joining)],
                ["Experience", experienceYears(faculty.date_of_joining)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ProfileCompletionRing percent={completeness} />
          <p className="text-xs text-slate-500">Profile complete</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={`/admin/faculty/${faculty.id}/edit`}
          className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          <PencilIcon className="h-4 w-4" /> Edit profile
        </Link>
        <Button variant="secondary" onClick={() => setActiveSection("activity")}>
          Timeline
        </Button>
        <Button variant="secondary" onClick={() => setActiveSection("academic-assignments")}>
          Assignments
        </Button>
        <Button variant="secondary" onClick={() => show("Notifications are coming soon.", "info")}>
          Notify
        </Button>
        <Button variant="secondary" onClick={() => setIdCardModalOpen(true)}>
          ID card
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
      </div>

      <div className="mt-6 flex gap-6">
        <aside className={`shrink-0 ${sectionsCollapsed ? "w-14" : "w-56"}`}>
          <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div
              className={`flex items-center border-b border-slate-100 px-1 pb-3 ${
                sectionsCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!sectionsCollapsed && (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sections</p>
              )}
              <button
                onClick={() => setSectionsCollapsed((v) => !v)}
                className="text-slate-400 hover:text-slate-600"
                aria-label={sectionsCollapsed ? "Expand sections" : "Collapse sections"}
              >
                <ChevronsLeftIcon className={`h-4 w-4 transition-transform ${sectionsCollapsed ? "rotate-180" : ""}`} />
              </button>
            </div>

            {sectionsCollapsed ? (
              <div className="flex flex-col items-center gap-2 pt-3">
                {SECTION_GROUPS.flatMap((group) => group.items)
                  .filter((item) => item.icon)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      title={item.label}
                      aria-label={item.label}
                      className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
                        activeSection === item.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                    </button>
                  ))}
              </div>
            ) : (
              <nav className="flex flex-col gap-4 pt-3">
                {SECTION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {group.label}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`flex items-center justify-between rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                            activeSection === item.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {item.icon ? <item.icon className="h-4 w-4 shrink-0" /> : <span className="w-4 shrink-0" />}
                            {item.label}
                          </span>
                          {item.soon && (
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                              Soon
                            </span>
                          )}
                          {item.id === "academic-assignments" && (
                            <span className="text-xs font-semibold text-slate-400">
                              {mappingsData?.meta.total ?? 0}
                            </span>
                          )}
                          {item.id === "documents" && (
                            <span className="text-xs font-semibold text-slate-400">{documents?.length ?? 0}</span>
                          )}
                          {item.id === "attendance" && attendance && (
                            <span className="text-xs font-semibold text-slate-400">
                              {attendance.overall.full_days +
                                attendance.overall.half_days +
                                attendance.overall.absent +
                                attendance.overall.on_leave +
                                attendance.overall.on_duty +
                                attendance.overall.on_vacation}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-6">
          {activeSection === "overview" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Overview</h3>
              <p className="mt-1 text-sm text-slate-500">Snapshot of {fullName(faculty)}&apos;s record.</p>
              <div className="mt-5">
                <InfoGrid
                  items={[
                    ["Faculty ID", formatFacultyCode(faculty.id)],
                    ["Name", fullName(faculty)],
                    ["Designation", faculty.designation],
                    ["Department", faculty.department?.name ?? "—"],
                    ["Date of joining", formatDate(faculty.date_of_joining)],
                    ["Email", faculty.email],
                    ["Phone", faculty.phone ?? "Not provided"],
                    ["Status", faculty.status === "active" ? "Active" : "Inactive"],
                  ]}
                />
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MiniStat
                  label="Subjects"
                  value={mappingsLoading ? "…" : String(distinctSubjectCount)}
                  caption="distinct subjects assigned"
                />
                <MiniStat
                  label="Classes"
                  value={mappingsLoading ? "…" : String(distinctClassCount)}
                  caption="distinct sections handled"
                />
                <MiniStat
                  label="Attendance"
                  value={attendanceLoading ? "…" : `${attendance?.overall.attendance_percentage ?? 0}%`}
                  caption="this academic year"
                />
              </div>
            </div>
          )}

          {activeSection === "personal" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
              <div className="mt-5">
                <InfoGrid
                  items={[
                    ["Full name", `${faculty.prefix ? `${faculty.prefix} ` : ""}${fullName(faculty)}`],
                    ["Gender", faculty.gender || "Not provided"],
                    ["Date of birth", faculty.date_of_birth ? formatDate(faculty.date_of_birth) : "Not provided"],
                    ["Personal email", faculty.personal_email || "Not provided"],
                    ["Phone", faculty.phone ?? "Not provided"],
                  ]}
                />
              </div>
            </div>
          )}

          {activeSection === "contact" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Contact</h3>
              <div className="mt-5">
                <InfoGrid
                  items={[
                    ["Login email", faculty.email],
                    ["Personal email", faculty.personal_email || "Not provided"],
                    ["Phone", faculty.phone ?? "Not provided"],
                    ["WhatsApp number", faculty.whatsapp_number || "Not provided"],
                    ["Alternate phone", faculty.alternate_phone || "Not provided"],
                    [
                      "Address",
                      [faculty.address_line, faculty.city, faculty.state, faculty.postal_code]
                        .filter(Boolean)
                        .join(", ") || "Not provided",
                    ],
                  ]}
                />
              </div>
            </div>
          )}

          {activeSection === "employment" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Employment</h3>
              <div className="mt-5">
                <InfoGrid
                  items={[
                    ["Designation", faculty.designation],
                    ["Department", faculty.department?.name ?? "—"],
                    ["Academic role", faculty.academic_role || "Not provided"],
                    ["Date of joining", formatDate(faculty.date_of_joining)],
                    ["Experience", experienceYears(faculty.date_of_joining)],
                    [
                      "Employment status",
                      (faculty.employment_status && EMPLOYMENT_STATUS_FROM_ENUM[faculty.employment_status]) ||
                        "Not provided",
                    ],
                    [
                      "Employment type",
                      (faculty.employment_type && EMPLOYEE_TYPE_FROM_ENUM[faculty.employment_type]) || "Not provided",
                    ],
                    ["Work location", faculty.work_location || "Not provided"],
                    [
                      "Confirmation date",
                      faculty.confirmation_date ? formatDate(faculty.confirmation_date) : "Not provided",
                    ],
                    ["Qualification", faculty.qualification || "Not provided"],
                    ["Specialization", faculty.specialization || "Not provided"],
                    ["Status", faculty.status === "active" ? "Active" : "Inactive"],
                    ["Reporting to", "Not available yet"],
                  ]}
                />
              </div>
            </div>
          )}

          {activeSection === "identity" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Identity</h3>
              <div className="mt-5">
                <InfoGrid
                  items={[
                    ["Aadhaar number", maskTail(faculty.sensitive_info?.aadhar_number)],
                    ["PAN number", faculty.sensitive_info?.pan_number || "Not provided"],
                    ["Bank name", faculty.sensitive_info?.bank_name || "Not provided"],
                    ["Bank IFSC", faculty.sensitive_info?.bank_ifsc || "Not provided"],
                    ["Bank account number", maskTail(faculty.sensitive_info?.bank_account_number)],
                  ]}
                />
              </div>
              <p className="mt-4 text-xs text-slate-500">Sensitive details are only visible to admins.</p>
            </div>
          )}

          {activeSection === "documents" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Documents</h3>

              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="min-w-[200px]">
                    <label className="mb-1 block text-xs font-medium text-slate-600">Document type</label>
                    <SelectInput value={newDocType} onChange={(e) => setNewDocType(e.target.value)}>
                      <option value="">Select type</option>
                      {ALL_DOCUMENT_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <Button type="button" variant="secondary" onClick={() => docUploadRef.current?.click()}>
                    Choose file
                  </Button>
                  <input
                    ref={docUploadRef}
                    type="file"
                    accept="application/pdf,image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => setSelectedDocFileName(e.target.files?.[0]?.name ?? null)}
                  />
                  {selectedDocFileName && (
                    <span className="max-w-[220px] truncate text-sm text-slate-600" title={selectedDocFileName}>
                      {selectedDocFileName}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    isPending={uploadDocument.isPending}
                    onClick={handleUploadDocument}
                  >
                    Upload
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Accepted formats: {DOCUMENT_FORMAT_HINT}.</p>
              </div>

              <div className="mt-5">
                {documentsLoading && <p className="text-sm text-slate-500">Loading…</p>}
                {!documentsLoading && (documents?.length ?? 0) === 0 && (
                  <EmptyState
                    title="No documents uploaded yet."
                    hint="Choose a document type and a file above, then click Upload."
                  />
                )}
                {!documentsLoading && documents && documents.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Type
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            File
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Uploaded
                          </th>
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id} className="border-b border-slate-100 last:border-b-0">
                            <td className="px-4 py-3 text-slate-700">{doc.document_type}</td>
                            <td className="px-4 py-3 text-slate-700">
                              {doc.url ? (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 text-blue-700 hover:underline"
                                >
                                  <DownloadIcon className="h-3.5 w-3.5" />
                                  {doc.file_name}
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-slate-400">
                                  <DownloadIcon className="h-3.5 w-3.5" />
                                  {doc.file_name} (unavailable)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{formatDate(doc.uploaded_at)}</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc.id)}
                                aria-label="Remove document"
                                className="text-slate-400 hover:text-red-600"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "academic-assignments" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Academic Assignments</h3>
              <p className="mt-1 text-sm text-slate-500">
                Subject/class teaching assignments from faculty-mapping.
              </p>
              <div className="mt-5">
                {mappingsLoading && <p className="text-sm text-slate-500">Loading…</p>}
                {!mappingsLoading && mappings.length === 0 && (
                  <EmptyState
                    title="No teaching assignments recorded yet."
                    hint="Subject/class mappings for this faculty will appear here once assigned."
                  />
                )}
                {!mappingsLoading && mappings.length > 0 && (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Subject
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Class
                          </th>
                          <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Academic year
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappings.map((mapping) => (
                          <tr key={mapping.id} className="border-b border-slate-100 last:border-b-0">
                            <td className="px-4 py-3 text-slate-700">{subjectLabel(mapping)}</td>
                            <td className="px-4 py-3 text-slate-700">{classLabel(mapping)}</td>
                            <td className="px-4 py-3 text-slate-700">{mapping.academic_year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "attendance" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Attendance</h3>
              <p className="mt-1 text-sm text-slate-500">Day-by-day presence — view only.</p>
              <div className="mt-5">
                {attendanceLoading && <p className="text-sm text-slate-500">Loading…</p>}
                {!attendanceLoading && attendance && attendance.months.length === 0 && (
                  <EmptyState
                    title="No attendance recorded yet."
                    hint="Nothing has populated this faculty's daily attendance yet."
                  />
                )}
                {!attendanceLoading && attendance && attendance.months.length > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                      <MiniStat
                        label="Full days"
                        value={String(attendance.overall.full_days)}
                        caption="this year"
                        tone="green"
                      />
                      <MiniStat
                        label="Half days"
                        value={String(attendance.overall.half_days)}
                        caption="this year"
                        tone="amber"
                      />
                      <MiniStat label="Absent" value={String(attendance.overall.absent)} caption="this year" tone="red" />
                      <MiniStat
                        label="On leave"
                        value={String(attendance.overall.on_leave)}
                        caption="counts against %, this year"
                        tone="amber"
                      />
                      <MiniStat
                        label="On duty / vacation"
                        value={String(attendance.overall.on_duty + attendance.overall.on_vacation)}
                        caption="excused, this year"
                        tone="blue"
                      />
                      <MiniStat
                        label="Attendance %"
                        value={`${attendance.overall.attendance_percentage}%`}
                        caption="full + half⁄2, over marked days"
                        tone="amber"
                      />
                    </div>
                    <div className="mt-5 flex flex-col gap-3">
                      {attendance.months.map((month, index) => {
                        const isExpanded = expandedMonths ? expandedMonths.has(month.month) : index === 0;
                        return (
                          <div key={month.month} className="rounded-lg border border-slate-200">
                            <button
                              onClick={() =>
                                setExpandedMonths((prev) => {
                                  const base = prev ?? new Set(attendance.months[0] ? [attendance.months[0].month] : []);
                                  const next = new Set(base);
                                  if (next.has(month.month)) next.delete(month.month);
                                  else next.add(month.month);
                                  return next;
                                })
                              }
                              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                            >
                              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                                <span className="text-sm font-bold text-slate-900">{month.label}</span>
                                <span className="text-xs text-slate-500">
                                  {month.full_days} Full · {month.half_days} Half · {month.absent} Absent ·{" "}
                                  {month.attendance_percentage}%
                                </span>
                              </div>
                              <ChevronRightIcon
                                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? "-rotate-90" : "rotate-90"}`}
                              />
                            </button>

                            {isExpanded && (
                              <div className="overflow-x-auto border-t border-slate-200">
                                <table className="w-full border-collapse text-sm">
                                  <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Date
                                      </th>
                                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Day
                                      </th>
                                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Punch in
                                      </th>
                                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Punch out
                                      </th>
                                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {month.days.map((day) => {
                                      const style = ATTENDANCE_STATUS_STYLES[day.status] ?? {
                                        label: day.status,
                                        tone: "slate" as PillTone,
                                      };
                                      return (
                                        <tr key={day.date} className="border-b border-slate-100 last:border-b-0">
                                          <td className="px-4 py-2.5 text-slate-700">{formatDayDate(day.date)}</td>
                                          <td className="px-4 py-2.5 text-slate-500">{day.day}</td>
                                          <td className="px-4 py-2.5 text-slate-700">{day.punch_in ?? "—"}</td>
                                          <td className="px-4 py-2.5 text-slate-700">{day.punch_out ?? "—"}</td>
                                          <td className="px-4 py-2.5">
                                            <StatusPill tone={style.tone}>{style.label}</StatusPill>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === "activity" && (
            <div>
              <h3 className="text-lg font-bold text-slate-900">Activity</h3>
              <div className="mt-5">
                {activityLoading && <p className="text-sm text-slate-500">Loading…</p>}
                {!activityLoading && (activity?.length ?? 0) === 0 && (
                  <EmptyState title="No recent activity recorded yet." hint="" />
                )}
                {!activityLoading && activity && activity.length > 0 && (
                  <ul className="flex flex-col gap-3">
                    {activity.map((entry) => (
                      <li key={entry.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm font-medium text-slate-800">{entry.description}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(entry.created_at)}
                          {entry.created_by_email ? ` · by ${entry.created_by_email}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {faculty.profile_url && (
        <Modal
          open={photoViewerOpen}
          onClose={() => setPhotoViewerOpen(false)}
          title={fullName(faculty)}
          subtitle="Profile photo"
          closeButtonVariant="bordered"
          widthClassName="max-w-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={faculty.profile_url} alt="" className="w-full rounded-lg object-cover" />
        </Modal>
      )}

      <FacultyIdCardModal
        open={idCardModalOpen}
        onClose={() => setIdCardModalOpen(false)}
        faculty={[faculty]}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { DownloadIcon, FileTextIcon, PeopleIcon } from "@/shared/components/icons";
import { ClockIcon } from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { facultyService } from "@/modules/faculty/services/faculty.service";
import { facultyMappingService } from "@/modules/faculty/services/faculty-mapping.service";
import { facultyKeys } from "@/modules/faculty/query-keys";
import {
  exportAssignmentsPdf,
  exportAttendanceSummaryPdf,
  exportFacultyRosterPdf,
  exportSingleFacultyReportPdf,
} from "@/modules/faculty/lib/faculty-report-pdfs";
import { fetchAllPages } from "@/modules/faculty/lib/report-export";
import { formatFacultyCode, fullName } from "@/modules/faculty/lib/faculty-format";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import type { Faculty } from "@/modules/faculty/types";

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_ACADEMIC_YEAR = `${CURRENT_YEAR}-${String((CURRENT_YEAR + 1) % 100).padStart(2, "0")}`;
const ACADEMIC_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const startYear = CURRENT_YEAR - i;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
});

interface ReportCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  isPending: boolean;
  onDownload: () => void;
  children?: React.ReactNode;
}

function ReportCard({ icon: Icon, title, description, isPending, onDownload, children }: ReportCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      {children}
      <Button variant="secondary" onClick={onDownload} isPending={isPending} className="self-start">
        <DownloadIcon className="h-4 w-4" /> Download PDF
      </Button>
    </div>
  );
}

export default function FacultyReportsPage() {
  const { show, showDetailed } = useToast();
  const { data: departments } = useDepartments();

  const [rosterPending, setRosterPending] = useState(false);

  const [attendanceYear, setAttendanceYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [attendanceDept, setAttendanceDept] = useState<number | undefined>(undefined);
  const [attendancePending, setAttendancePending] = useState(false);

  const [assignmentsYear, setAssignmentsYear] = useState("");
  const [assignmentsPending, setAssignmentsPending] = useState(false);

  const [frQuery, setFrQuery] = useState("");
  const debouncedFrQuery = useDebouncedValue(frQuery);
  const [frDept, setFrDept] = useState<number | undefined>(undefined);
  const [frYear, setFrYear] = useState(DEFAULT_ACADEMIC_YEAR);
  const [downloadingFacultyId, setDownloadingFacultyId] = useState<number | null>(null);

  const { data: frData, isLoading: frLoading } = useQuery({
    queryKey: facultyKeys.list({ search: debouncedFrQuery, department_id: frDept, all: true }),
    queryFn: () =>
      fetchAllPages((page, limit) =>
        facultyService.list({ search: debouncedFrQuery || undefined, department_id: frDept, page, limit }),
      ),
  });
  const frRows = frData?.rows ?? [];

  async function handleRosterDownload() {
    setRosterPending(true);
    try {
      const { rows } = await fetchAllPages((page, limit) => facultyService.list({ page, limit }));
      exportFacultyRosterPdf(rows);
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't generate the roster.", "error");
    } finally {
      setRosterPending(false);
    }
  }

  async function handleAttendanceDownload() {
    setAttendancePending(true);
    try {
      const overview = await facultyService.getAttendanceOverview({
        academic_year: attendanceYear,
        department_id: attendanceDept,
      });
      if (overview.rows.length === 0) {
        show("No attendance records for this academic year.", "info");
        return;
      }
      exportAttendanceSummaryPdf(overview.rows, {
        academicYear: attendanceYear,
        department: attendanceDept ? departments?.find((d) => d.id === attendanceDept)?.code : undefined,
      });
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't generate the attendance summary.", "error");
    } finally {
      setAttendancePending(false);
    }
  }

  async function handleAssignmentsDownload() {
    if (!assignmentsYear.trim()) {
      show("Enter an academic year first — this report isn't run unfiltered.", "error");
      return;
    }
    setAssignmentsPending(true);
    try {
      const { rows, truncated } = await fetchAllPages((page, limit) =>
        facultyMappingService.list({ academic_year: assignmentsYear.trim(), page, limit }),
      );
      if (rows.length === 0) {
        show("No assignments found for that academic year.", "info");
        return;
      }
      exportAssignmentsPdf(rows, { academicYear: assignmentsYear.trim() });
      if (truncated) {
        showDetailed(
          "Report truncated",
          "This academic year has more assignments than one report covers — only the first 3,000 rows were exported. Narrow further if you need the rest.",
          "info",
        );
      }
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't generate the assignments report.", "error");
    } finally {
      setAssignmentsPending(false);
    }
  }

  async function handleDownloadFacultyReport(faculty: Faculty) {
    setDownloadingFacultyId(faculty.id);
    try {
      const [attendance, mappingsRes] = await Promise.all([
        facultyService.getAttendance(faculty.id, frYear),
        facultyMappingService.list({ faculty_id: faculty.id, academic_year: frYear, limit: 100 }),
      ]);
      exportSingleFacultyReportPdf(faculty, frYear, attendance.overall, mappingsRes.data);
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't generate this faculty's report.", "error");
    } finally {
      setDownloadingFacultyId(null);
    }
  }

  return (
    <div>
      <nav className="mb-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link href="/admin/faculty" className="hover:text-slate-700">
          Faculty
        </Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-slate-700">Reports</span>
      </nav>

      <PageHeader title="Reports" description="Download data exports for offline use or sharing." />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ReportCard
          icon={PeopleIcon}
          title="Faculty Roster"
          description="Every faculty member — name, designation, department, contact info, and status."
          isPending={rosterPending}
          onDownload={handleRosterDownload}
        />

        <ReportCard
          icon={ClockIcon}
          title="Attendance Summary"
          description="Full/half day, absent, and on-duty counts per faculty for an academic year."
          isPending={attendancePending}
          onDownload={handleAttendanceDownload}
        >
          <div className="flex gap-2">
            <div className="flex-1">
              <SelectInput value={attendanceYear} onChange={(e) => setAttendanceYear(e.target.value)}>
                {ACADEMIC_YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    AY {y}
                  </option>
                ))}
              </SelectInput>
            </div>
            <div className="flex-1">
              <SelectInput
                value={attendanceDept ?? ""}
                onChange={(e) => setAttendanceDept(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Departments</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.code}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>
        </ReportCard>

        <ReportCard
          icon={FileTextIcon}
          title="Academic Assignments"
          description="Subject/class teaching assignments for a chosen academic year."
          isPending={assignmentsPending}
          onDownload={handleAssignmentsDownload}
        >
          <SearchInput
            placeholder="Academic year, e.g. 2026-27 (required)"
            value={assignmentsYear}
            onChange={(e) => setAssignmentsYear(e.target.value)}
          />
        </ReportCard>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-bold text-slate-900">Faculty Reports</h3>
        <p className="mt-1 text-sm text-slate-500">
          Search for a faculty member and download their individual report — profile, attendance, and
          assignments for the chosen academic year.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="max-w-sm flex-1">
            <SearchInput
              placeholder="Search faculty…"
              value={frQuery}
              onChange={(e) => setFrQuery(e.target.value)}
            />
          </div>
          <div className="w-48">
            <SelectInput
              value={frDept ?? ""}
              onChange={(e) => setFrDept(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All Departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="w-36">
            <SelectInput value={frYear} onChange={(e) => setFrYear(e.target.value)}>
              {ACADEMIC_YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  AY {y}
                </option>
              ))}
            </SelectInput>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {frLoading && <p className="p-6 text-sm text-slate-500">Loading…</p>}
          {!frLoading && frRows.length === 0 && (
            <p className="p-6 text-sm text-slate-500">No faculty match these filters.</p>
          )}
          {!frLoading && frRows.length > 0 && (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Faculty
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Designation
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Department
                  </th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {frRows.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FacultyAvatar faculty={f} className="h-8 w-8 shrink-0 rounded-full text-xs" />
                        <div>
                          <p className="font-medium text-slate-900">{fullName(f)}</p>
                          <p className="text-xs text-slate-500">{formatFacultyCode(f.id)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{f.designation}</td>
                    <td className="px-4 py-3 text-slate-600">{f.department?.code ?? f.department?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDownloadFacultyReport(f)}
                        disabled={downloadingFacultyId === f.id}
                        aria-label={`Download report for ${fullName(f)}`}
                        title="Download report"
                        className="text-slate-400 hover:text-blue-700 disabled:opacity-40"
                      >
                        {downloadingFacultyId === f.id ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                          <DownloadIcon className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

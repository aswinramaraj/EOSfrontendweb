"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { ApiError } from "@/shared/lib/api-client";
import { DownloadIcon, XIcon } from "@/shared/components/icons";
import { facultyService } from "@/modules/faculty/services/faculty.service";
import { facultyKeys } from "@/modules/faculty/query-keys";
import { fetchAllPages } from "@/modules/faculty/lib/report-export";
import { exportAssignmentsPdf } from "@/modules/faculty/lib/faculty-report-pdfs";
import { useFacultyMappingsBrowse } from "@/modules/faculty/hooks/useFacultyMappings";
import { FacultyPaginationBar } from "@/modules/faculty/components/FacultyPaginationBar";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { FacultyAvatar } from "@/modules/faculty/components/FacultyAvatar";
import { formatFacultyCode, fullName } from "@/modules/faculty/lib/faculty-format";

const DEFAULT_PAGE_SIZE = 20;
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const startYear = CURRENT_YEAR - i;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
});

export default function FacultyAssignmentsPage() {
  const [facultyQuery, setFacultyQuery] = useState("");
  const [facultyDept, setFacultyDept] = useState<number | undefined>(undefined);
  const [selectedFaculty, setSelectedFaculty] = useState<{ id: number; label: string } | null>(null);
  const [academicYear, setAcademicYear] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data: departments } = useDepartments();

  // All faculty, fetched once — filtering by name/department below happens
  // client-side against this list rather than a fresh request per keystroke.
  const { data: allFaculty } = useQuery({
    queryKey: facultyKeys.list({ all: true }),
    queryFn: () => fetchAllPages((page, limit) => facultyService.list({ page, limit })),
  });

  const showSuggestions = facultyQuery.trim().length > 0 && !selectedFaculty;
  const facultySuggestions = useMemo(() => {
    if (!showSuggestions) return [];
    const needle = facultyQuery.trim().toLowerCase();
    return (allFaculty?.rows ?? [])
      .filter((f) => (facultyDept ? f.department_id === facultyDept : true))
      .filter((f) => fullName(f).toLowerCase().includes(needle))
      .sort((a, b) => fullName(a).localeCompare(fullName(b)))
      .slice(0, 8);
  }, [allFaculty, facultyDept, facultyQuery, showSuggestions]);

  const { data, isLoading, error } = useFacultyMappingsBrowse({
    faculty_id: selectedFaculty?.id,
    academic_year: academicYear || undefined,
    page,
    limit: pageSize,
  });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta.total ?? 0;

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
        <span className="font-medium text-slate-700">Academic Assignments</span>
      </nav>

      <PageHeader
        title="Academic Assignments"
        actions={
          <Button
            variant="secondary"
            onClick={() => exportAssignmentsPdf(rows, { academicYear: academicYear || undefined })}
          >
            <DownloadIcon className="h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          {selectedFaculty ? (
            <div className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
              <span>{selectedFaculty.label}</span>
              <button
                onClick={() => {
                  setSelectedFaculty(null);
                  setFacultyQuery("");
                  setPage(1);
                }}
                aria-label="Clear faculty filter"
                className="text-blue-500 hover:text-blue-800"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <SearchInput
              placeholder="Search faculty…"
              value={facultyQuery}
              onChange={(e) => setFacultyQuery(e.target.value)}
            />
          )}

          {showSuggestions && facultySuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              {facultySuggestions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFaculty({ id: f.id, label: `${fullName(f)} · ${formatFacultyCode(f.id)}` });
                    setFacultyQuery("");
                    setPage(1);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <FacultyAvatar faculty={f} className="h-6 w-6 shrink-0 rounded-full text-[10px]" />
                  <span className="text-slate-700">{fullName(f)}</span>
                  <span className="text-xs text-slate-400">{formatFacultyCode(f.id)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-48">
          <SelectInput
            value={facultyDept ?? ""}
            onChange={(e) => setFacultyDept(e.target.value ? Number(e.target.value) : undefined)}
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
          <SelectInput
            value={academicYear}
            onChange={(e) => {
              setAcademicYear(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All years</option>
            {ACADEMIC_YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                AY {y}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {isLoading && <p className="p-6 text-sm text-slate-500">Loading…</p>}
        {error && (
          <p className="p-6 text-sm text-red-600">
            {error instanceof ApiError ? error.message : "Couldn't load assignments."}
          </p>
        )}
        {!isLoading && !error && rows.length === 0 && (
          <p className="p-6 text-sm text-slate-500">No assignments match these filters.</p>
        )}
        {!isLoading && !error && rows.length > 0 && (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Faculty
                </th>
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
              {rows.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FacultyAvatar faculty={m.faculty} className="h-8 w-8 shrink-0 rounded-full text-xs" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {m.faculty.first_name} {m.faculty.last_name}
                        </p>
                        <p className="text-xs text-slate-500">{formatFacultyCode(m.faculty.id)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-800">{m.subject.name}</p>
                    <p className="text-xs text-slate-400">{m.subject.subject_code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {m.class.department.code} · Section {m.class.section}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{m.academic_year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <FacultyPaginationBar
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}

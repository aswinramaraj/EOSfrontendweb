"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ChevronLeftIcon, DownloadIcon, XIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useStudentReport } from "@/modules/placement/hooks/useStudentReport";
import { useBatches } from "@/modules/placement/hooks/useBatches";
import { useStudentReportDownload } from "@/modules/placement/hooks/useStudentReportDownload";
import { StudentDriveHistoryModal } from "@/modules/placement/components/students/StudentDriveHistoryModal";
import type { StudentReportRow } from "@/modules/placement/types";

const PAGE_SIZE = 20;

function StudentReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classFromUrl = searchParams.get("class");
  const arrivedFromReports = classFromUrl !== null;

  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [attendedFilter, setAttendedFilter] = useState<"all" | "attended" | "not_attended">("all");
  const [batchId, setBatchId] = useState<number | "all">("all");
  // Seeded from ?class=... (e.g. arriving from the Reports page's class-wise
  // drill-down) — a dismissible filter, not tied to the URL after that, so
  // clearing it doesn't fight back on every re-render.
  const [classFilter, setClassFilter] = useState<string | null>(classFromUrl);
  const [page, setPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentReportRow | null>(null);

  const { data: batches } = useBatches();
  const { data, isLoading, error } = useStudentReport(batchId === "all" ? undefined : batchId);
  const { show } = useToast();
  const pdfDownload = useStudentReportDownload();
  const excelDownload = useStudentReportDownload();

  function handleDownload(format: "pdf" | "excel") {
    const mutation = format === "pdf" ? pdfDownload : excelDownload;
    mutation.mutate(
      { format, batchId: batchId === "all" ? undefined : batchId, classLabel: classFilter ?? undefined },
      {
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  const departments = useMemo(() => {
    const names = new Set((data ?? []).map((s) => s.departmentName).filter((n): n is string => !!n));
    return Array.from(names).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((s) => {
      const matchesQuery =
        !q ||
        (s.name ?? "").toLowerCase().includes(q) ||
        s.studentIdNo.toLowerCase().includes(q) ||
        (s.rollNo ?? "").toLowerCase().includes(q);
      const matchesDept = departmentFilter === "all" || s.departmentName === departmentFilter;
      const matchesAttended =
        attendedFilter === "all" ||
        (attendedFilter === "attended" ? s.drivesApplied > 0 : s.drivesApplied === 0);
      const matchesClass = !classFilter || s.classLabel === classFilter;
      return matchesQuery && matchesDept && matchesAttended && matchesClass;
    });
  }, [data, query, departmentFilter, attendedFilter, classFilter]);

  const total = filtered.length;
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateFilter<T>(setter: (v: T) => void, value: T) {
    setter(value);
    setPage(1);
  }

  const columns: DataTableColumn<StudentReportRow>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name ?? row.studentIdNo}</p>
          <p className="text-xs text-slate-500">{row.studentIdNo}</p>
        </div>
      ),
    },
    { key: "class", header: "Class", render: (row) => row.classLabel ?? "—" },
    { key: "department", header: "Department", render: (row) => row.departmentName ?? "—" },
    {
      key: "attended",
      header: "Attended",
      render: (row) =>
        row.drivesApplied > 0 ? (
          <StatusPill tone="green">Attended · {row.drivesApplied}</StatusPill>
        ) : (
          <StatusPill tone="slate">Not attended</StatusPill>
        ),
    },
  ];

  return (
    <div>
      {arrivedFromReports && (
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
        >
          <ChevronLeftIcon className="h-4 w-4" /> Back to Reports
        </button>
      )}

      <PageHeader
        title="Student Reports"
        description="Every student's placement participation — click a row for their full drive history."
      />

      {classFilter && (
        <button
          type="button"
          onClick={() => updateFilter(setClassFilter, null)}
          className="mb-3 flex w-fit items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
        >
          Class: {classFilter} <XIcon className="h-3 w-3" />
        </button>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Search name, roll no or ID..."
            value={query}
            onChange={(e) => updateFilter(setQuery, e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Sized wrappers, not same-element width overrides — SelectInput's
              internal w-full needs a sized parent to actually shrink. */}
          <div className="w-44">
            <SelectInput
              value={batchId}
              onChange={(e) => updateFilter(setBatchId, e.target.value === "all" ? "all" : Number(e.target.value))}
            >
              <option value="all">All batches</option>
              {batches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="w-52">
            <SelectInput
              value={departmentFilter}
              onChange={(e) => updateFilter(setDepartmentFilter, e.target.value)}
            >
              <option value="all">All departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </SelectInput>
          </div>
          <div className="w-40">
            <SelectInput
              value={attendedFilter}
              onChange={(e) => updateFilter(setAttendedFilter, e.target.value as typeof attendedFilter)}
            >
              <option value="all">All students</option>
              <option value="attended">Attended</option>
              <option value="not_attended">Not attended</option>
            </SelectInput>
          </div>
          <Button variant="secondary" size="sm" isPending={pdfDownload.isPending} onClick={() => handleDownload("pdf")}>
            <DownloadIcon className="h-4 w-4" /> PDF
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isPending={excelDownload.isPending}
            onClick={() => handleDownload("excel")}
          >
            <DownloadIcon className="h-4 w-4" /> Excel
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={visible}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load student report." : null}
        emptyMessage="No students match these filters."
        onRowClick={setSelectedStudent}
        footer={
          total > 0 && (
            <PaginationBar page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )
        }
      />

      <StudentDriveHistoryModal
        open={selectedStudent !== null}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  );
}

export default function StudentReportsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <StudentReportsContent />
    </Suspense>
  );
}

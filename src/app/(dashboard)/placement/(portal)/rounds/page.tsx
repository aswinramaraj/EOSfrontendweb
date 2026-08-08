"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { ChevronLeftIcon, DownloadIcon, PlusIcon, TrashIcon, UploadIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { saveBlob } from "@/shared/lib/download-file";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useDrives } from "@/modules/placement/hooks/useDrives";
import { useApplications } from "@/modules/placement/hooks/useApplications";
import { useEligibleStudents } from "@/modules/placement/hooks/useEligibleStudents";
import {
  useAddApplication,
  useImportApplications,
  useRemoveApplication,
  useUpdateApplicationStatus,
} from "@/modules/placement/hooks/useApplicationMutations";
import type { ApplicationStatus, DriveApplication, EligibleStudent, PlacementDrive } from "@/modules/placement/types";

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "r1_cleared", label: "R1 cleared" },
  { value: "r2_cleared", label: "R2 cleared" },
  { value: "r3_cleared", label: "R3 cleared" },
  { value: "rejected", label: "Rejected" },
  { value: "placed", label: "Placed" },
];

const STATUS_LABEL: Record<ApplicationStatus, string> = Object.fromEntries(
  STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<ApplicationStatus, string>;

const DRIVE_STATUS_LABEL: Record<PlacementDrive["status"], string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const DRIVE_STATUS_TONE: Record<PlacementDrive["status"], PillTone> = {
  scheduled: "blue",
  completed: "slate",
  cancelled: "red",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Landing view — every drive with its student count, so it's immediately
// clear this page spans many drives rather than reading as "the" drive.
function DriveListView() {
  const router = useRouter();
  const { data: drives, isLoading } = useDrives();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return drives ?? [];
    return (drives ?? []).filter((d) => d.companyName.toLowerCase().includes(q));
  }, [drives, query]);

  const columns: DataTableColumn<PlacementDrive>[] = [
    {
      key: "company",
      header: "Company",
      render: (row) => <span className="font-semibold text-blue-700">{row.isDisclosed ? row.companyName : `Company #${row.companyId}`}</span>,
    },
    { key: "role", header: "Role", render: (row) => row.role ?? "—" },
    { key: "scheduledDate", header: "Drive date", render: (row) => formatDate(row.scheduledDate) },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill tone={DRIVE_STATUS_TONE[row.status]}>{DRIVE_STATUS_LABEL[row.status]}</StatusPill>,
    },
    { key: "appliedCount", header: "Students", align: "right", render: (row) => row.appliedCount },
  ];

  return (
    <div>
      <PageHeader
        title="Round Management"
        description="Pick a drive to manage its students and round status."
        actions={
          <div className="w-64">
            <SearchInput placeholder="Search company..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => router.push(`/placement/rounds?drive=${row.id}`)}
        emptyMessage="No placement drives yet."
      />
    </div>
  );
}

function DriveDetailView({ driveId }: { driveId: number }) {
  const router = useRouter();
  const { data: drives } = useDrives();
  const { data: eligibleStudents } = useEligibleStudents();
  const { show } = useToast();

  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [studentQuery, setStudentQuery] = useState("");
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null);
  const [removeTarget, setRemoveTarget] = useState<DriveApplication | null>(null);

  const drive = drives?.find((d) => d.id === driveId) ?? null;

  const { data: applications, isLoading, error } = useApplications(driveId);
  const addApplication = useAddApplication(driveId);
  const importApplications = useImportApplications(driveId);
  const updateStatus = useUpdateApplicationStatus(driveId);
  const removeApplication = useRemoveApplication(driveId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = useMemo(() => {
    const names = new Set((applications ?? []).map((a) => a.departmentName).filter((n): n is string => !!n));
    return Array.from(names).sort();
  }, [applications]);

  const visibleApplications = (applications ?? []).filter(
    (a) =>
      (statusFilter === "all" || a.status === statusFilter) &&
      (departmentFilter === "all" || a.departmentName === departmentFilter),
  );

  const counts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, o) => {
    acc[o.value] = (applications ?? []).filter((a) => a.status === o.value).length;
    return acc;
  }, {});

  const departmentCounts = departments.reduce<Record<string, number>>((acc, dept) => {
    acc[dept] = (applications ?? []).filter((a) => a.departmentName === dept).length;
    return acc;
  }, {});

  const alreadyAppliedIds = useMemo(
    () => new Set((applications ?? []).map((a) => a.studentId)),
    [applications],
  );

  const filteredStudents = useMemo(() => {
    if (!eligibleStudents) return [];
    const pool = eligibleStudents.filter((s) => !alreadyAppliedIds.has(s.id));
    if (!studentQuery.trim()) return pool.slice(0, 20);
    const q = studentQuery.toLowerCase();
    return pool
      .filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.studentIdNo.toLowerCase().includes(q) ||
          s.rollNo?.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [eligibleStudents, alreadyAppliedIds, studentQuery]);

  function handleAddStudent() {
    if (!selectedStudent) {
      show("Pick a student first.", "error");
      return;
    }
    addApplication.mutate(
      { studentId: selectedStudent.id },
      {
        onSuccess: () => {
          show("Student added to drive.", "success");
          setSelectedStudent(null);
          setStudentQuery("");
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  // A plain single-column CSV — the importer itself doesn't enforce a
  // layout (it flattens every cell and matches whatever looks like a real
  // ID), but a template still keeps people from adding extra columns
  // (name, department, ...) that would just show up as "not found" noise.
  function handleDownloadTemplate() {
    const csv = "Student ID or Roll No\n23IT001\n23CB002\n";
    saveBlob(new Blob([csv], { type: "text/csv" }), "student-import-template.csv");
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file (e.g. after fixing it) later
    if (!file) return;

    importApplications.mutate(file, {
      onSuccess: (result) => {
        const parts = [`${result.added} added`];
        if (result.alreadyAdded.length) parts.push(`${result.alreadyAdded.length} already in drive`);
        if (result.notFound.length) parts.push(`${result.notFound.length} not found`);
        show(parts.join(" · "), result.added > 0 ? "success" : "error");
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  function handleStatusChange(studentId: number, status: ApplicationStatus) {
    updateStatus.mutate(
      { studentId, status },
      {
        onSuccess: () => show("Application status updated.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function handleRemoveConfirm() {
    if (!removeTarget) return;
    removeApplication.mutate(removeTarget.studentId, {
      onSuccess: () => {
        show("Removed from drive.", "success");
        setRemoveTarget(null);
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  const columns: DataTableColumn<DriveApplication>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.studentName ?? row.studentIdNo}</p>
          {row.studentName && <p className="text-xs text-slate-500">{row.studentIdNo}</p>}
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: () => drive?.companyName ?? "—",
    },
    {
      key: "class",
      header: "Class",
      render: (row) => row.classLabel ?? "—",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <span className="font-semibold text-slate-800">{STATUS_LABEL[row.status]}</span>,
    },
    {
      key: "update",
      header: "Update status",
      render: (row) => (
        <SelectInput
          className="w-40"
          value={row.status}
          onChange={(e) => handleStatusChange(row.studentId, e.target.value as ApplicationStatus)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectInput>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <button onClick={() => setRemoveTarget(row)} className="text-slate-400 hover:text-red-600" aria-label="Remove from drive">
          <TrashIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-3 flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline"
      >
        <ChevronLeftIcon className="h-4 w-4" /> Back to Drives
      </button>

      <PageHeader
        title="Round Management"
        description={drive ? `${drive.companyName}${drive.role ? ` · ${drive.role}` : ""} · ${formatDate(drive.scheduledDate)}` : undefined}
      />

      {!drive && <p className="text-sm text-slate-500">Drive not found.</p>}

      {drive && (
        <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-end gap-2">
              <div className="relative w-72">
                <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="student-search">
                  Add student
                </label>
                <SearchInput
                  id="student-search"
                  placeholder="Search name, roll no or ID..."
                  value={selectedStudent ? selectedStudent.name ?? selectedStudent.studentIdNo : studentQuery}
                  onChange={(e) => {
                    setSelectedStudent(null);
                    setStudentQuery(e.target.value);
                    setStudentPickerOpen(true);
                  }}
                  onFocus={() => setStudentPickerOpen(true)}
                  onBlur={() => setTimeout(() => setStudentPickerOpen(false), 150)}
                />
                {studentPickerOpen && filteredStudents.length > 0 && (
                  <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedStudent(s);
                          setStudentQuery("");
                          setStudentPickerOpen(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-900">{s.name ?? s.studentIdNo}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {s.studentIdNo}
                          {s.classLabel ? ` · ${s.classLabel}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="primary"
                onClick={handleAddStudent}
                isPending={addApplication.isPending}
                disabled={!selectedStudent}
              >
                <PlusIcon className="h-4 w-4" /> Add to drive
              </Button>
              <span className="pb-1.5 text-xs text-slate-400">or</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileSelected}
              />
              <Button variant="secondary" onClick={handleImportClick} isPending={importApplications.isPending}>
                <UploadIcon className="h-4 w-4" /> Import from file
              </Button>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button variant="secondary" onClick={handleDownloadTemplate}>
                <DownloadIcon className="h-4 w-4" /> Download template
              </Button>
              <p className="max-w-xs text-right text-xs text-slate-500">
                CSV or Excel with a column of student IDs or roll numbers — e.g. a company&apos;s shortlist.
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {visibleApplications.length} student{visibleApplications.length === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <SelectInput
                className="w-52"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All departments · {(applications ?? []).length}</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept} · {departmentCounts[dept]}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                className="w-48"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "all")}
              >
                <option value="all">All statuses · {(applications ?? []).length}</option>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label} · {counts[o.value]}
                  </option>
                ))}
              </SelectInput>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={visibleApplications}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            error={error instanceof ApiError ? error.message : error ? "Failed to load applications." : null}
            emptyMessage="No students added to this drive yet."
          />
        </>
      )}

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove from drive"
        message={`Remove student ${removeTarget?.studentIdNo} from this drive? This can't be undone.`}
        confirmLabel="Remove"
        tone="danger"
        isPending={removeApplication.isPending}
        onConfirm={handleRemoveConfirm}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}

function RoundManagementContent() {
  const searchParams = useSearchParams();
  const driveIdParam = searchParams.get("drive");
  const driveId = driveIdParam ? Number(driveIdParam) : null;

  return driveId ? <DriveDetailView driveId={driveId} /> : <DriveListView />;
}

export default function RoundManagementPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <RoundManagementContent />
    </Suspense>
  );
}

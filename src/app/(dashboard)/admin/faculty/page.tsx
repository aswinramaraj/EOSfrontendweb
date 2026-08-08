"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import {
  AlertTriangleIcon,
  ClockIcon,
  DownloadIcon,
  IdCardIcon,
  PeopleIcon,
  PersonIcon,
  PersonPlusIcon,
  UploadIcon,
} from "@/shared/components/icons";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { useFacultyPreferences } from "@/modules/faculty/hooks/useFacultyPreferences";
import { FacultyTable, type FacultySortDirection } from "@/modules/faculty/components/FacultyTable";
import { FacultyStatCard } from "@/modules/faculty/components/FacultyStatCard";
import { FacultyPaginationBar } from "@/modules/faculty/components/FacultyPaginationBar";
import { FacultyBulkActionsBar } from "@/modules/faculty/components/FacultyBulkActionsBar";
import {
  FacultyFiltersBar,
  type FacultyFiltersValue,
} from "@/modules/faculty/components/FacultyFiltersBar";
import { FacultyQuickViewDrawer } from "@/modules/faculty/components/FacultyQuickViewDrawer";
import { FacultyImportModal } from "@/modules/faculty/components/FacultyImportModal";
import { FacultyIdCardModal } from "@/modules/faculty/components/FacultyIdCardModal";
import { exportFacultyRosterPdf } from "@/modules/faculty/lib/faculty-report-pdfs";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { DESIGNATION_OPTIONS } from "@/modules/faculty/lib/faculty-wizard-config";
import type { Faculty } from "@/modules/faculty/types";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export default function FacultyListPage() {
  const router = useRouter();
  const { preferences } = useFacultyPreferences();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [filters, setFilters] = useState<FacultyFiltersValue>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => preferences.pageSize);
  const [sortDirection, setSortDirection] = useState<FacultySortDirection>(() => preferences.sortDirection);
  const [viewTargetId, setViewTargetId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [importOpen, setImportOpen] = useState(false);
  const [idCardFaculty, setIdCardFaculty] = useState<Faculty[] | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useFaculties({
    department_id: filters.department_id,
    status: filters.status,
    designation: filters.designation,
    year: filters.year,
    search: debouncedQuery || undefined,
    page,
    limit: pageSize,
  });

  // Global counts, independent of the current filters/page — each is a
  // cheap limit:1 fetch, reading only the total from its pagination meta.
  const { data: activeData } = useFaculties({ status: "active", limit: 1 });
  const { data: inactiveData } = useFaculties({ status: "inactive", limit: 1 });
  const { data: probationData } = useFaculties({ employment_status: "probation", limit: 1 });

  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.meta.total ?? 0;
  const activeCount = activeData?.meta.total ?? 0;
  const inactiveCount = inactiveData?.meta.total ?? 0;
  const probationCount = probationData?.meta.total ?? 0;

  // The backend always orders by id — sort direction here only reorders the
  // current page's rows by name, not the full filtered set across pages.
  const sortedRows = useMemo(() => {
    const factor = sortDirection === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => factor * fullName(a).localeCompare(fullName(b)));
  }, [rows, sortDirection]);

  function toggleSelectAllOnPage() {
    const allOnPageSelected = sortedRows.length > 0 && sortedRows.every((row) => selectedIds.has(row.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      sortedRows.forEach((row) => (allOnPageSelected ? next.delete(row.id) : next.add(row.id)));
      return next;
    });
  }

  function toggleSelectOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedRows = sortedRows.filter((row) => selectedIds.has(row.id));

  function handleGenerateIdCards() {
    if (selectedRows.length === 0) {
      show("Select one or more faculty first.", "error");
      return;
    }
    setIdCardFaculty(selectedRows);
  }

  return (
    <div>
      <nav className="mb-2 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-slate-700">Faculty</span>
      </nav>

      <PageHeader
        title="All Faculty"
        description={`${total} records · ${activeCount} active`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(true)}>
              <UploadIcon className="h-4 w-4" /> Import
            </Button>
            <Button variant="secondary" onClick={handleGenerateIdCards}>
              <IdCardIcon className="h-4 w-4" /> ID cards
            </Button>
            <Link
              href="/admin/faculty/new"
              className="inline-flex items-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              <PersonPlusIcon className="h-4 w-4" /> Add Faculty
            </Link>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FacultyStatCard label="Total faculty" value={activeCount + inactiveCount} icon={PeopleIcon} tone="blue" />
        <FacultyStatCard label="Active" value={activeCount} icon={PersonIcon} tone="green" />
        <FacultyStatCard label="Inactive" value={inactiveCount} icon={AlertTriangleIcon} tone="amber" />
        <FacultyStatCard label="On probation" value={probationCount} icon={ClockIcon} tone="purple" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => show("Column visibility is coming soon.", "info")}>
            Columns
          </Button>
          <Button variant="secondary" onClick={() => exportFacultyRosterPdf(sortedRows)}>
            <DownloadIcon className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <FacultyFiltersBar
          value={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
          designationOptions={DESIGNATION_OPTIONS}
          yearOptions={YEAR_OPTIONS}
        />
      </div>

      {selectedIds.size > 0 && (
        <FacultyBulkActionsBar
          count={selectedIds.size}
          onNotify={() => show("Notifications are coming soon.", "info")}
          onExportSelected={() => exportFacultyRosterPdf(selectedRows)}
          onGenerateIdCards={handleGenerateIdCards}
          onClearSelection={() => setSelectedIds(new Set())}
        />
      )}

      <FacultyTable
        rows={sortedRows}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load faculty." : null}
        sortDirection={sortDirection}
        onSortToggle={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
        onView={(f) => setViewTargetId(f.id)}
        onEdit={(f) => router.push(`/admin/faculty/${f.id}/edit`)}
        selectedIds={selectedIds}
        onToggleAll={toggleSelectAllOnPage}
        onToggleOne={toggleSelectOne}
        hiddenColumns={new Set(preferences.hiddenColumns)}
        footer={
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
        }
      />

      <FacultyQuickViewDrawer
        facultyId={viewTargetId}
        onClose={() => setViewTargetId(null)}
        onEdit={(faculty) => {
          setViewTargetId(null);
          router.push(`/admin/faculty/${faculty.id}/edit`);
        }}
      />

      <FacultyImportModal open={importOpen} onClose={() => setImportOpen(false)} />

      <FacultyIdCardModal
        open={idCardFaculty !== null}
        onClose={() => setIdCardFaculty(null)}
        faculty={idCardFaculty ?? []}
      />
    </div>
  );
}

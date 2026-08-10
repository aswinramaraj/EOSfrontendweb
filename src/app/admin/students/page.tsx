"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { StatCard } from "@/shared/components/ui/StatCard";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { Drawer } from "@/shared/components/ui/Drawer";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { ApiError } from "@/shared/lib/api-client";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BusIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  HomeIcon,
  IdCardIcon,
  PencilIcon,
  PeopleIcon,
  PersonIcon,
  SendIcon,
  StarIcon,
  UploadIcon,
  UserPlusIcon,
} from "@/shared/components/icons";
import { useStudents } from "@/modules/students/hooks/useStudents";
import { useStudentCount } from "@/modules/students/hooks/useStudentCount";
import { StudentFilters, type StudentFiltersValue } from "@/modules/students/components/StudentFilters";
import { ColumnsMenu, type ColumnOption } from "@/modules/students/components/ColumnsMenu";
import { avatarTint, formatDate, initials, studentName } from "@/modules/students/lib/format";
import type { ListStudentsParams, StudentListItem } from "@/modules/students/types";

const PAGE_SIZE = 10;

const COLUMN_OPTIONS: ColumnOption[] = [
  { key: "student", label: "Student", locked: true },
  { key: "department", label: "Department" },
  { key: "batch", label: "Batch" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "contact", label: "Contact" },
  { key: "admission_date", label: "Admitted" },
  { key: "actions", label: "Actions", locked: true },
];

interface Tab {
  id: string;
  label: string;
  filters: StudentFiltersValue;
  /** No real data to back this view yet — shown to match the reference's full tab set, disabled until it exists. */
  soonReason?: string;
}

const TABS: Tab[] = [
  { id: "all", label: "All students", filters: {} },
  { id: "active", label: "Active only", filters: { status: "active" } },
  { id: "fee-defaulters", label: "Fee defaulters", filters: {}, soonReason: "Needs a per-student fee-status endpoint — none exists yet" },
  { id: "attendance-risk", label: "Attendance risk", filters: {}, soonReason: "Needs an attendance-summary endpoint — none exists yet" },
  { id: "final-year", label: "Final year", filters: {}, soonReason: "Needs a per-student study-year field — not in the schema yet" },
];

/** Matches the reference drawer's headline metric tiles — shown, disabled, since none of the three exist as per-student data yet. */
function MetricBox({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3" title={reason}>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-slate-300">—</p>
    </div>
  );
}

/** Matches the reference's `.kv-row` (dt fixed at 200px, dd fills the rest, hairline between rows). */
function KvRow({ label, value, muted, reason }: { label: string; value: string; muted?: boolean; reason?: string }) {
  return (
    <div className="flex gap-4 border-b border-slate-100 py-3 last:border-b-0" title={reason}>
      <dt className="w-[200px] shrink-0 text-sm text-slate-400">{label}</dt>
      <dd className={`min-w-0 text-sm ${muted ? "text-slate-300" : "text-slate-700"}`}>{value}</dd>
    </div>
  );
}

export default function AdminStudentsPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [filters, setFilters] = useState<StudentFiltersValue>({});
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(COLUMN_OPTIONS.map((c) => c.key)),
  );
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [quickViewRow, setQuickViewRow] = useState<StudentListItem | null>(null);

  const params: ListStudentsParams = {
    q: debouncedQuery || undefined,
    ...filters,
    page,
    limit: PAGE_SIZE,
  };

  const { data, isLoading, error } = useStudents(params);
  const total = useStudentCount({});
  const active = useStudentCount({ status: "active" });
  const inactive = useStudentCount({ status: "inactive" });
  const hostellers = useStudentCount({ student_type: "hosteller" });
  const dayscholars = useStudentCount({ student_type: "dayscholar" });

  function selectTab(tab: Tab) {
    if (tab.soonReason) return;
    setActiveTab(tab.id);
    setFilters(tab.filters);
    setPage(1);
    setSelectedIds(new Set());
  }

  function updateFilters(next: StudentFiltersValue) {
    setFilters(next);
    setActiveTab("all"); // manual filter changes fall out of the preset tabs
    setPage(1);
    setSelectedIds(new Set());
  }

  function goToPage(next: number) {
    setPage(next);
    setSelectedIds(new Set());
  }

  function toggleColumn(key: string) {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const pageRows = data?.data ?? [];
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((row) => selectedIds.has(row.id));
  const someOnPageSelected = pageRows.some((row) => selectedIds.has(row.id));

  function toggleRow(row: StudentListItem) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageRows.forEach((row) => next.delete(row.id));
      } else {
        pageRows.forEach((row) => next.add(row.id));
      }
      return next;
    });
  }

  const columns: DataTableColumn<StudentListItem>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => {
        const tint = avatarTint(row.id);
        return (
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold"
              style={row.photo_url ? undefined : { background: tint.bg, color: tint.fg }}
            >
              {row.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- a Supabase Storage URL, not a local/optimizable asset
                <img src={row.photo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(row.first_name, row.last_name)
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{studentName(row.first_name, row.last_name)}</p>
              <p className="text-xs text-slate-500">
                {row.roll_no ?? row.student_id_no} · {row.register_no ?? "—"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "department",
      header: "Department",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.department?.name ?? "—"}</p>
          <p className="text-xs text-slate-500">
            {row.course?.code ?? "—"}
            {row.class?.section ? ` · Sec ${row.class.section}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (row) => row.batch?.name ?? "—",
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <StatusPill tone={row.student_type === "hosteller" ? "blue" : "slate"}>
          {row.student_type === "hosteller" ? "Hosteller" : "Day scholar"}
        </StatusPill>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusPill tone={row.status === "active" ? "green" : "slate"}>
          {row.status === "active" ? "Active" : "Inactive"}
        </StatusPill>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <div>
          <p className="text-slate-700">{row.phone ?? "—"}</p>
          <p className="truncate text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "admission_date",
      header: "Admitted",
      align: "right",
      render: (row) => <span className="text-slate-500">{formatDate(row.admission_date)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title="Quick view"
            aria-label={`Quick view ${studentName(row.first_name, row.last_name)}`}
            onClick={() => setQuickViewRow(row)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled
            title="Edit — student edit page not built yet"
            aria-label={`Edit ${studentName(row.first_name, row.last_name)}`}
            className="cursor-not-allowed rounded-md p-1.5 text-slate-300"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled
            title="Timeline — no per-student activity endpoint yet"
            aria-label={`Timeline for ${studentName(row.first_name, row.last_name)}`}
            className="cursor-not-allowed rounded-md p-1.5 text-slate-300"
          >
            <ActivityIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/admin" className="hover:text-slate-700">
          Home
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span className="font-medium text-slate-700">Students</span>
      </nav>

      <PageHeader
        title="Students"
        description={
          total.data !== undefined && active.data !== undefined
            ? `${total.data.toLocaleString()} records · ${active.data.toLocaleString()} active`
            : "Loading roll…"
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled title="Import — module planned">
              <UploadIcon className="h-4 w-4" /> Import
            </Button>
            <Button
              variant="secondary"
              disabled
              title={
                selectedIds.size > 0
                  ? `ID cards for ${selectedIds.size} selected — module planned`
                  : "Select students, then ID cards — module planned"
              }
            >
              <IdCardIcon className="h-4 w-4" /> ID cards
            </Button>
            <Link href="/admin/students/admit">
              <Button variant="primary">
                <UserPlusIcon className="h-4 w-4" /> Admit student
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total in view" value={total.data ?? "…"} icon={PeopleIcon} tone="blue" />
        <StatCard label="Active" value={active.data ?? "…"} icon={PersonIcon} tone="green" />
        {/* "slate", not red/amber — matches this same page's own StatusPill
            convention where inactive renders as a neutral gray pill, not an
            alert color; an inactive count isn't inherently a problem. */}
        <StatCard label="Inactive" value={inactive.data ?? "…"} icon={AlertTriangleIcon} tone="slate" />
        <StatCard label="Hostellers" value={hostellers.data ?? "…"} icon={HomeIcon} tone="slate" />
        <StatCard label="Day scholars" value={dayscholars.data ?? "…"} icon={BusIcon} tone="slate" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab)}
              disabled={!!tab.soonReason}
              title={tab.soonReason}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                tab.soonReason
                  ? "cursor-not-allowed text-slate-300"
                  : activeTab === tab.id
                    ? "bg-blue-700 text-white"
                    : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled
          title="Save current view — no saved-views backend yet"
          className="flex cursor-not-allowed items-center gap-1.5 text-sm font-medium text-slate-300"
        >
          <StarIcon className="h-3.5 w-3.5" /> Save current view
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            name="student_search"
            placeholder="Search by name, roll no, register no, email…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
              setSelectedIds(new Set());
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-400 sm:inline">Click a row for a quick view</span>
          {selectedIds.size > 0 && (
            <span className="text-xs font-medium text-slate-500">{selectedIds.size} selected</span>
          )}
          <ColumnsMenu columns={COLUMN_OPTIONS} visible={visibleColumns} onToggle={toggleColumn} />
          <Button variant="secondary" disabled title="Export — no CSV export endpoint yet">
            <DownloadIcon className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <StudentFilters value={filters} onChange={updateFilters} onClearAll={() => updateFilters({})} />
      </div>

      <DataTable
        columns={columns.filter((col) => visibleColumns.has(col.key))}
        rows={pageRows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load students." : null}
        emptyMessage="No students match this view."
        selection={{
          isSelected: (row) => selectedIds.has(row.id),
          onToggle: toggleRow,
          onToggleAll: toggleAllOnPage,
          allSelected: allOnPageSelected,
          someSelected: someOnPageSelected,
        }}
        onRowClick={setQuickViewRow}
      />
      {data && (
        <PaginationBar page={data.meta.page} pageSize={data.meta.limit} total={data.meta.total} onPageChange={goToPage} />
      )}

      <Drawer
        open={quickViewRow !== null}
        onClose={() => setQuickViewRow(null)}
        eyebrow={quickViewRow?.roll_no ?? quickViewRow?.student_id_no ?? undefined}
        title={quickViewRow ? studentName(quickViewRow.first_name, quickViewRow.last_name) : ""}
        headActions={
          quickViewRow && (
            <Link href={`/admin/students/${quickViewRow.id}`}>
              <Button variant="secondary" size="sm">
                Full profile
              </Button>
            </Link>
          )
        }
        footer={
          quickViewRow && (
            <>
              <Link href={`/admin/students/${quickViewRow.id}`} className="grow">
                <Button variant="primary" className="w-full justify-center">
                  Open full profile
                </Button>
              </Link>
              <Button variant="secondary" disabled title="Notifications — no messaging backend yet" aria-label="Send notification">
                <SendIcon className="h-4 w-4" />
              </Button>
              <Button variant="secondary" disabled title="Edit — student edit page not built yet" aria-label="Edit student">
                <PencilIcon className="h-4 w-4" />
              </Button>
            </>
          )
        }
      >
        {quickViewRow && (
          <div className="flex flex-col gap-5">
            <div className="flex gap-4">
              <span
                className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl text-2xl font-semibold"
                style={
                  quickViewRow.photo_url
                    ? undefined
                    : { background: avatarTint(quickViewRow.id).bg, color: avatarTint(quickViewRow.id).fg }
                }
              >
                {quickViewRow.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a Supabase Storage URL, not a local/optimizable asset
                  <img src={quickViewRow.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(quickViewRow.first_name, quickViewRow.last_name)
                )}
              </span>
              <div className="flex grow flex-col gap-2">
                <div>
                  <StatusPill tone={quickViewRow.status === "active" ? "green" : "slate"}>
                    {quickViewRow.status === "active" ? "Active" : "Inactive"}
                  </StatusPill>
                </div>
                <p className="text-sm text-slate-500">{quickViewRow.department?.name ?? "—"}</p>
                <p className="text-xs text-slate-400">
                  {quickViewRow.course?.name ?? "—"}
                  {quickViewRow.class?.section ? ` · Section ${quickViewRow.class.section}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricBox label="Attendance" reason="No attendance-summary endpoint yet" />
              <MetricBox label="CGPA" reason="No marks/grades module yet" />
              <MetricBox label="Arrears" reason="No marks/grades module yet" />
            </div>

            <hr className="border-slate-200" />

            <dl className="flex flex-col">
              <KvRow label="Register number" value={quickViewRow.register_no ?? "—"} />
              <KvRow label="Batch" value={quickViewRow.batch?.name ?? "—"} />
              <KvRow label="Quota" value={quickViewRow.quota?.name ?? "—"} />
              <KvRow label="Class advisor" value="Not tracked" muted reason="No advisor assignment in the schema yet" />
              <KvRow label="Fees" value="Not tracked" muted reason="No per-student fee-summary endpoint yet" />
              <KvRow
                label="Residence"
                value={quickViewRow.student_type === "hosteller" ? "Hosteller" : "Day scholar"}
              />
              <KvRow label="Mobile" value={quickViewRow.phone ?? "—"} />
              <KvRow label="Email" value={quickViewRow.email} />
            </dl>

            <hr className="border-slate-200" />

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Recent activity</p>
              <p className="text-sm text-slate-400" title="No per-student activity/audit-log endpoint yet">
                Not available — no activity feed exists yet.
              </p>
            </div>
          </div>
        )}
      </Drawer>

      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        Showing only what the database actually has today: identity, batch/course/department, residence type,
        status, contact, and admission date. CGPA, attendance %, fee status and placement are intentionally left
        out — none of those exist as queryable per-student data yet (no marks/grades module, no attendance
        aggregate, no per-student fee summary endpoint). Sorting isn&apos;t wired up either — the list is ordered
        most-recently-admitted first.
      </p>
    </div>
  );
}

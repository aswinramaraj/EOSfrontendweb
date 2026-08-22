"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError } from "@/shared/lib/api-client";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { Drawer } from "@/shared/components/ui/Drawer";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { PlacementStatCard } from "@/modules/placement/components/PlacementStatCard";
import {
  PlacementTable,
  placementResetButtonStyle,
  placementSearchInputStyle,
  type PlacementTableColumn,
} from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import {
  ChevronRightIcon,
  DownloadIcon,
  PencilIcon,
  SendIcon,
  StarIcon,
  UploadIcon,
  IdCardIcon,
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

function tabButtonStyle(active: boolean, disabled: boolean): React.CSSProperties {
  return {
    height: 32,
    borderRadius: 8,
    padding: "0 14px",
    fontSize: 12.5,
    fontWeight: 600,
    border: "1px solid transparent",
    background: disabled ? undefined : active ? "#1f4fd8" : undefined,
    color: disabled ? "#c3cad4" : active ? "#fff" : "#3f4b60",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

export default function AdminStudentsPage() {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedQuery = useDebouncedValue(query);
  const [filters, setFilters] = useState<StudentFiltersValue>({});
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(COLUMN_OPTIONS.map((c) => c.key)),
  );
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
  }

  function updateFilters(next: StudentFiltersValue) {
    setFilters(next);
    setActiveTab("all"); // manual filter changes fall out of the preset tabs
    setPage(1);
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

  const columns: PlacementTableColumn<StudentListItem>[] = [
    {
      key: "student",
      label: "Student",
      width: "1.3fr",
      strong: true,
      leading: (row) => {
        const tint = avatarTint(row.id);
        return (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-semibold"
            style={row.photo_url ? undefined : { background: tint.bg, color: tint.fg }}
          >
            {row.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- a Supabase Storage URL, not a local/optimizable asset
              <img src={row.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(row.first_name, row.last_name)
            )}
          </span>
        );
      },
      render: (row) => ({
        text: studentName(row.first_name, row.last_name),
        sub: `${row.roll_no ?? row.student_id_no} · ${row.register_no ?? "—"}`,
      }),
    },
    {
      key: "department",
      label: "Department",
      width: "1.1fr",
      render: (row) => ({
        text: row.department?.name ?? "—",
        sub: `${row.course?.code ?? "—"}${row.class?.section ? ` · Sec ${row.class.section}` : ""}`,
      }),
    },
    {
      key: "batch",
      label: "Batch",
      width: ".8fr",
      render: (row) => ({ text: row.batch?.name ?? "—" }),
    },
    {
      key: "type",
      label: "Type",
      width: ".8fr",
      type: "badge",
      render: (row) => ({ text: row.student_type === "hosteller" ? "Hosteller" : "Day scholar" }),
    },
    {
      key: "status",
      label: "Status",
      width: ".7fr",
      type: "badge",
      render: (row) => ({ text: row.status === "active" ? "Active" : "Inactive" }),
    },
    {
      key: "contact",
      label: "Contact",
      width: "1.1fr",
      render: (row) => ({ text: row.phone ?? "—", sub: row.email }),
    },
    {
      key: "admission_date",
      label: "Admitted",
      width: ".8fr",
      align: "right",
      render: (row) => ({ text: formatDate(row.admission_date) }),
    },
    {
      key: "actions",
      label: "",
      width: "1.5fr",
      type: "action",
      align: "right",
      actions: (row) => [
        { label: "View", onClick: () => setQuickViewRow(row) },
        { label: "Edit", disabled: true, title: "Student edit page not built yet", onClick: () => {} },
        { label: "Timeline", disabled: true, title: "No per-student activity endpoint yet", onClick: () => {} },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <nav className="flex items-center gap-1.5 text-[12.5px]" style={{ color: "#8b95a6" }}>
        <Link href="/admin" className="hover:text-[#1f4fd8]">
          Home
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span style={{ fontWeight: 600, color: "#3f4b60" }}>Students</span>
      </nav>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Students</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            {total.data !== undefined && active.data !== undefined
              ? `${total.data.toLocaleString()} records · ${active.data.toLocaleString()} active`
              : "Loading roll…"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" disabled title="Import — module planned" style={{ ...pageButtonStyle(false), opacity: 0.5, cursor: "not-allowed" }}>
            <span className="inline-flex items-center gap-1.5">
              <UploadIcon className="h-3.5 w-3.5" /> Import
            </span>
          </button>
          <button
            type="button"
            disabled
            title="ID cards — module planned"
            style={{ ...pageButtonStyle(false), opacity: 0.5, cursor: "not-allowed" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <IdCardIcon className="h-3.5 w-3.5" /> ID cards
            </span>
          </button>
          <Link href="/admin/students/admit">
            <button type="button" style={pageButtonStyle(true)}>
              <span className="inline-flex items-center gap-1.5">
                <UserPlusIcon className="h-3.5 w-3.5" /> Admit student
              </span>
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
        <PlacementStatCard label="Total in view" value={total.data ?? "…"} />
        <PlacementStatCard label="Active" value={active.data ?? "…"} />
        <PlacementStatCard label="Inactive" value={inactive.data ?? "…"} />
        <PlacementStatCard label="Hostellers" value={hostellers.data ?? "…"} />
        <PlacementStatCard label="Day scholars" value={dayscholars.data ?? "…"} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab)}
              disabled={!!tab.soonReason}
              title={tab.soonReason}
              style={tabButtonStyle(activeTab === tab.id, !!tab.soonReason)}
              className={activeTab !== tab.id && !tab.soonReason ? "hover:bg-[#f3f6fb]" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled
          title="Save current view — no saved-views backend yet"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#c3cad4", background: "none", border: "none", cursor: "not-allowed" }}
        >
          <StarIcon className="h-3.5 w-3.5" /> Save current view
        </button>
      </div>

      <StudentFilters value={filters} onChange={updateFilters} onClearAll={() => updateFilters({})} />

      <PlacementTable
        toolbar={
          <>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search by name, roll no, register no, email…"
              style={placementSearchInputStyle(searchFocused)}
            />
            <span style={{ fontSize: 11.5, color: "#8b95a6" }}>Click a row for a quick view</span>
            <ColumnsMenu columns={COLUMN_OPTIONS} visible={visibleColumns} onToggle={toggleColumn} />
            <button
              type="button"
              disabled
              title="Export — no CSV export endpoint yet"
              style={{ ...placementResetButtonStyle(false), display: "inline-flex", alignItems: "center", gap: 6, opacity: 0.5, cursor: "not-allowed" }}
            >
              <DownloadIcon className="h-3.5 w-3.5" /> Export
            </button>
          </>
        }
        columns={columns.filter((col) => visibleColumns.has(col.key))}
        rows={pageRows}
        rowKey={(row) => row.id}
        onRowClick={setQuickViewRow}
        sort={null}
        onSortChange={() => {}}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        totalCount={data?.meta.total}
        emptyMessage={isLoading ? "Loading…" : error instanceof ApiError ? error.message : error ? "Failed to load students." : "No students match this view."}
      />

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

      <p className="text-xs leading-relaxed text-slate-400">
        Showing only what the database actually has today: identity, batch/course/department, residence type,
        status, contact, and admission date. CGPA, attendance %, fee status and placement are intentionally left
        out — none of those exist as queryable per-student data yet (no marks/grades module, no attendance
        aggregate, no per-student fee summary endpoint). Sorting isn&apos;t wired up either — the list is ordered
        most-recently-admitted first.
      </p>
    </div>
  );
}

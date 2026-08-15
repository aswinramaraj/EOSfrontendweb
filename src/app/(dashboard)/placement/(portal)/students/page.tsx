"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useStudentReport } from "@/modules/placement/hooks/useStudentReport";
import { useBatches } from "@/modules/placement/hooks/useBatches";
import { useStudentReportDownload } from "@/modules/placement/hooks/useStudentReportDownload";
import { useUpdatePlacementStatus } from "@/modules/placement/hooks/useUpdatePlacementStatus";
import { PlacementStatCard } from "@/modules/placement/components/PlacementStatCard";
import {
  PlacementTable,
  placementResetButtonStyle,
  placementSearchInputStyle,
  placementSelectStyle,
  type PlacementTableColumn,
  type PlacementTableSort,
} from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import type { StudentReportRow } from "@/modules/placement/types";

const PAGE_SIZE = 10;

function yearLabel(year: number | null): string {
  if (year == null) return "—";
  const suffix = year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th";
  return `${year}${suffix} Year`;
}

function statusLabel(status: StudentReportRow["status"]): string {
  if (status === "placed") return "Placed";
  if (status === "rejected") return "Not placed";
  if (status === null) return "Not applied";
  return "In process";
}

// Opt-out overrides eligibility in display — a student who opted out isn't
// meaningfully "eligible" or "not eligible" for this cycle anymore.
function eligibilityLabel(r: StudentReportRow): string {
  if (r.placementOptedOut) return "Opted out";
  if (r.placementEligible === true) return "Eligible";
  if (r.placementEligible === false) return "Not eligible";
  return "Not assessed";
}

function StudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classFromUrl = searchParams.get("class");
  const arrivedFromReports = classFromUrl !== null;

  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [batchId, setBatchId] = useState<number | "all">("all");
  const [department, setDepartment] = useState("All departments");
  const [year, setYear] = useState("All years");
  const [status, setStatus] = useState("All statuses");
  const [classFilter, setClassFilter] = useState<string | null>(classFromUrl);
  const [sort, setSort] = useState<PlacementTableSort | null>(null);
  const [page, setPage] = useState(1);
  const [resetHover, setResetHover] = useState(false);

  const { data: batches } = useBatches();
  const { data, isLoading, error } = useStudentReport(batchId === "all" ? undefined : batchId);
  const { show } = useToast();
  const pdfDownload = useStudentReportDownload();
  const excelDownload = useStudentReportDownload();
  const updatePlacementStatus = useUpdatePlacementStatus();

  function setEligible(r: StudentReportRow, value: boolean) {
    updatePlacementStatus.mutate(
      { studentId: r.id, input: { placementEligible: value } },
      {
        onSuccess: () => show(value ? "Marked eligible." : "Marked not eligible.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function setOptedOut(r: StudentReportRow, value: boolean) {
    updatePlacementStatus.mutate(
      { studentId: r.id, input: { placementOptedOut: value } },
      {
        onSuccess: () => show(value ? "Marked opted out." : "Cleared opt-out.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function handleDownload(format: "pdf" | "excel") {
    const mutation = format === "pdf" ? pdfDownload : excelDownload;
    mutation.mutate(
      { format, batchId: batchId === "all" ? undefined : batchId, classLabel: classFilter ?? undefined },
      { onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error") },
    );
  }

  function resetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const rows = useMemo(() => data ?? [], [data]);

  const departmentOptions = useMemo(() => {
    const names = new Set(rows.map((r) => r.departmentCode ?? r.departmentName).filter((n): n is string => !!n));
    return ["All departments", ...Array.from(names).sort()];
  }, [rows]);

  const yearOptions = useMemo(() => {
    const years = new Set(rows.map((r) => r.year).filter((y): y is number => y != null));
    return ["All years", ...Array.from(years).sort().map(yearLabel)];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        (r.name ?? "").toLowerCase().includes(q) ||
        r.studentIdNo.toLowerCase().includes(q) ||
        (r.rollNo ?? "").toLowerCase().includes(q) ||
        (r.registerNo ?? "").toLowerCase().includes(q) ||
        (r.departmentName ?? "").toLowerCase().includes(q) ||
        (r.departmentCode ?? "").toLowerCase().includes(q);
      const matchesDept = department === "All departments" || r.departmentCode === department || r.departmentName === department;
      const matchesYear = year === "All years" || yearLabel(r.year) === year;
      const matchesStatus = status === "All statuses" || statusLabel(r.status) === status;
      const matchesClass = !classFilter || r.classLabel === classFilter;
      return matchesQuery && matchesDept && matchesYear && matchesStatus && matchesClass;
    });
  }, [rows, query, department, year, status, classFilter]);

  const total = rows.length;
  const placedCount = rows.filter((r) => r.status === "placed").length;
  const placedPct = total > 0 ? Math.round((placedCount / total) * 100) : 0;
  const departmentCount = new Set(rows.map((r) => r.departmentCode ?? r.departmentName).filter(Boolean)).size;
  const eligibleCount = rows.filter((r) => r.placementEligible === true).length;
  const assessedCount = rows.filter((r) => r.placementEligible !== null).length;
  const optedOutCount = rows.filter((r) => r.placementOptedOut).length;

  const columns: PlacementTableColumn<StudentReportRow>[] = [
    {
      key: "reg",
      label: "Register number",
      width: "1fr",
      type: "mono",
      sortValue: (r) => r.registerNo ?? r.rollNo ?? r.studentIdNo,
      render: (r) => ({ text: r.registerNo ?? r.rollNo ?? r.studentIdNo }),
    },
    {
      key: "name",
      label: "Student",
      width: "1.3fr",
      strong: true,
      sortValue: (r) => r.name ?? r.studentIdNo,
      render: (r) => ({ text: r.name ?? r.studentIdNo }),
    },
    {
      key: "dept",
      label: "Department",
      width: ".8fr",
      sortValue: (r) => r.departmentCode ?? r.departmentName ?? "",
      render: (r) => ({ text: r.departmentCode ?? r.departmentName ?? "—" }),
    },
    {
      key: "year",
      label: "Year",
      width: ".8fr",
      sortValue: (r) => r.year ?? 0,
      render: (r) => ({ text: yearLabel(r.year) }),
    },
    {
      key: "cgpa",
      label: "CGPA",
      width: ".6fr",
      type: "mono",
      render: () => ({ text: "—" }),
    },
    {
      key: "backlogs",
      label: "Backlogs",
      width: ".7fr",
      type: "mono",
      render: () => ({ text: "—" }),
    },
    {
      key: "eligibility",
      label: "Eligibility",
      width: ".9fr",
      type: "badge",
      sortValue: (r) => eligibilityLabel(r),
      render: (r) => ({ text: eligibilityLabel(r) }),
    },
    {
      key: "apps",
      label: "Applied",
      width: ".7fr",
      type: "mono",
      sortValue: (r) => r.drivesApplied,
      render: (r) => ({ text: String(r.drivesApplied) }),
    },
    {
      key: "offers",
      label: "Offers",
      width: ".6fr",
      type: "mono",
      sortValue: (r) => r.offersCount,
      render: (r) => ({ text: String(r.offersCount) }),
    },
    {
      key: "status",
      label: "Status",
      width: ".9fr",
      type: "badge",
      sortValue: (r) => statusLabel(r.status),
      render: (r) => ({ text: statusLabel(r.status) }),
    },
    {
      key: "actions",
      label: "",
      width: "1.3fr",
      type: "action",
      align: "right",
      actions: (r) => [
        r.placementEligible === true
          ? { label: "Mark not eligible", onClick: () => setEligible(r, false) }
          : { label: "Mark eligible", onClick: () => setEligible(r, true) },
        r.placementOptedOut
          ? { label: "Clear opt-out", onClick: () => setOptedOut(r, false) }
          : { label: "Mark opted out", tone: "danger", onClick: () => setOptedOut(r, true) },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {arrivedFromReports && (
        <button
          type="button"
          onClick={() => router.back()}
          style={{ alignSelf: "flex-start", fontSize: 12.5, fontWeight: 600, color: "#1f4fd8", background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back to Reports
        </button>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Students</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Application history and placement status across {total.toLocaleString()} registered students.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button
            type="button"
            onClick={() => handleDownload("pdf")}
            disabled={pdfDownload.isPending}
            style={pageButtonStyle(false)}
          >
            {pdfDownload.isPending ? "Exporting…" : "Export PDF"}
          </button>
          <button
            type="button"
            onClick={() => handleDownload("excel")}
            disabled={excelDownload.isPending}
            style={pageButtonStyle(false)}
          >
            {excelDownload.isPending ? "Exporting…" : "Export Excel"}
          </button>
        </div>
      </div>

      {classFilter && (
        <button
          type="button"
          onClick={() => resetPage(setClassFilter)(null)}
          style={{
            alignSelf: "flex-start",
            height: 28,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11.5,
            fontWeight: 600,
            color: "#1f4fd8",
            background: "#e8f0fe",
            border: "none",
            borderRadius: 6,
            padding: "0 10px",
            cursor: "pointer",
          }}
        >
          Class: {classFilter} ×
        </button>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
        <PlacementStatCard label="Registered students" value={total.toLocaleString()} caption={`Across ${departmentCount} departments`} />
        <PlacementStatCard
          label="Eligible this cycle"
          value={eligibleCount.toLocaleString()}
          caption={assessedCount > 0 ? `${assessedCount} of ${total.toLocaleString()} assessed so far` : "Mark students eligible from the table below"}
        />
        <PlacementStatCard
          label="Placed"
          value={placedCount.toLocaleString()}
          caption={`${placedPct}% of ${total.toLocaleString()} registered`}
          progressPercent={placedPct}
        />
        <PlacementStatCard
          label="Opted out"
          value={optedOutCount.toLocaleString()}
          caption={optedOutCount > 0 ? `${optedOutCount} of ${total.toLocaleString()} registered` : "None recorded yet"}
        />
      </div>

      <PlacementTable
        toolbar={
          <>
            <input
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search students"
              style={placementSearchInputStyle(searchFocused)}
            />
            <select
              value={batchId === "all" ? "all" : String(batchId)}
              onChange={(e) => resetPage(setBatchId)(e.target.value === "all" ? "all" : Number(e.target.value))}
              style={placementSelectStyle}
            >
              <option value="all">All batches</option>
              {batches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select value={department} onChange={(e) => resetPage(setDepartment)(e.target.value)} style={placementSelectStyle}>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select value={year} onChange={(e) => resetPage(setYear)(e.target.value)} style={placementSelectStyle}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} style={placementSelectStyle}>
              {["All statuses", "Placed", "In process", "Not placed", "Not applied"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setBatchId("all");
                setDepartment("All departments");
                setYear("All years");
                setStatus("All statuses");
                setSort(null);
                setPage(1);
              }}
              onMouseEnter={() => setResetHover(true)}
              onMouseLeave={() => setResetHover(false)}
              style={placementResetButtonStyle(resetHover)}
            >
              Reset
            </button>
          </>
        }
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        onRowClick={(r) => router.push(`/placement/students/${r.id}`)}
        sort={sort}
        onSortChange={resetPage(setSort)}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage={isLoading ? "Loading…" : error ? "Failed to load student report." : "No students match these filters."}
      />
    </div>
  );
}

export default function StudentsPage() {
  return (
    <Suspense fallback={<p style={{ fontSize: 13, color: "#77808f" }}>Loading…</p>}>
      <StudentsContent />
    </Suspense>
  );
}

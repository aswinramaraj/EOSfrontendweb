"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOffers } from "@/modules/placement/hooks/useOffers";
import { useStudentReport } from "@/modules/placement/hooks/useStudentReport";
import { useDashboardSummary } from "@/modules/placement/hooks/useDashboardSummary";
import { PlacementStatCard } from "@/modules/placement/components/PlacementStatCard";
import { DepartmentPlacementBars } from "@/modules/placement/components/placements/DepartmentPlacementBars";
import { PackageBandsBarChart } from "@/modules/placement/components/placements/PackageBandsBarChart";
import {
  PlacementTable,
  placementResetButtonStyle,
  placementSearchInputStyle,
  placementSelectStyle,
  type PlacementTableColumn,
  type PlacementTableSort,
} from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import type { Offer } from "@/modules/placement/types";

const PAGE_SIZE = 8;

function lpa(value: number | undefined): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

function joiningLabel(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function PlacementsContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [department, setDepartment] = useState("All departments");
  const [joining, setJoining] = useState("All joining");
  const [sort, setSort] = useState<PlacementTableSort | null>(null);
  const [page, setPage] = useState(1);
  const [resetHover, setResetHover] = useState(false);

  const { data: offersData, isLoading, error } = useOffers();
  const { data: studentReport } = useStudentReport();
  const { data: summary } = useDashboardSummary();

  function resetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const rows = useMemo(() => (offersData ?? []).filter((o) => o.offerResponse === "accepted"), [offersData]);
  const totalStudents = studentReport?.length ?? 0;

  const departmentOptions = useMemo(() => {
    const codes = new Set(rows.map((r) => r.departmentCode).filter((c): c is string => !!c));
    return ["All departments", ...Array.from(codes).sort()];
  }, [rows]);

  const joiningOptions = useMemo(() => {
    const labels = new Set(rows.map((r) => joiningLabel(r.joiningDate)).filter((l) => l !== "—"));
    return ["All joining", ...Array.from(labels).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q || (r.studentName ?? r.studentIdNo).toLowerCase().includes(q) || r.companyName.toLowerCase().includes(q);
      const matchesDept = department === "All departments" || r.departmentCode === department;
      const matchesJoining = joining === "All joining" || joiningLabel(r.joiningDate) === joining;
      return matchesQuery && matchesDept && matchesJoining;
    });
  }, [rows, query, department, joining]);

  const placed = rows.length;
  const placementPct = totalStudents > 0 ? Math.round((placed / totalStudents) * 1000) / 10 : 0;
  const trend = summary?.sixYearTrend ?? [];
  const trendDelta =
    trend.length >= 2 ? Math.round((trend[trend.length - 1].rate - trend[trend.length - 2].rate) * 10) / 10 : null;

  const packages = rows.map((r) => r.offeredPackageLpa ?? r.packageLpa).filter((p): p is number => p != null);
  const averagePackage = packages.length ? packages.reduce((a, b) => a + b, 0) / packages.length : null;
  const highestRow = rows.reduce<Offer | null>((best, r) => {
    const p = r.offeredPackageLpa ?? r.packageLpa ?? -1;
    const bestP = best ? (best.offeredPackageLpa ?? best.packageLpa ?? -1) : -1;
    return p > bestP ? r : best;
  }, null);

  function handleExport() {
    const header = ["Student", "Register number", "Dept", "Company", "Role", "CTC", "Joining", "Location", "Status"];
    const body = filtered.map((r) => [
      r.studentName ?? r.studentIdNo,
      r.registerNo ?? r.rollNo ?? r.studentIdNo,
      r.departmentCode ?? "—",
      r.companyName,
      r.jobRole ?? "—",
      lpa(r.offeredPackageLpa ?? r.packageLpa),
      joiningLabel(r.joiningDate),
      r.workLocation ?? "—",
      "Accepted",
    ]);
    downloadCsv("placements.csv", [header, ...body]);
  }

  const columns: PlacementTableColumn<Offer>[] = [
    {
      key: "student",
      label: "Student",
      width: "1.1fr",
      strong: true,
      sortValue: (r) => r.studentName ?? r.studentIdNo,
      render: (r) => ({ text: r.studentName ?? r.studentIdNo }),
    },
    {
      key: "reg",
      label: "Register number",
      width: "1fr",
      type: "mono",
      sortValue: (r) => r.registerNo ?? r.rollNo ?? r.studentIdNo,
      render: (r) => ({ text: r.registerNo ?? r.rollNo ?? r.studentIdNo }),
    },
    {
      key: "dept",
      label: "Dept",
      width: ".7fr",
      sortValue: (r) => r.departmentCode ?? "",
      render: (r) => ({ text: r.departmentCode ?? "—" }),
    },
    {
      key: "company",
      label: "Company",
      width: "1fr",
      strong: true,
      sortValue: (r) => r.companyName,
      render: (r) => ({ text: r.companyName }),
    },
    {
      key: "role",
      label: "Role",
      width: "1.2fr",
      sortValue: (r) => r.jobRole ?? "",
      render: (r) => ({ text: r.jobRole ?? "—" }),
    },
    {
      key: "ctc",
      label: "CTC",
      width: ".8fr",
      type: "mono",
      sortValue: (r) => r.offeredPackageLpa ?? r.packageLpa ?? -1,
      render: (r) => ({ text: lpa(r.offeredPackageLpa ?? r.packageLpa) }),
    },
    {
      key: "joining",
      label: "Joining",
      width: ".8fr",
      sortValue: (r) => r.joiningDate ?? "",
      render: (r) => ({ text: joiningLabel(r.joiningDate) }),
    },
    {
      key: "location",
      label: "Location",
      width: ".9fr",
      sortValue: (r) => r.workLocation ?? "",
      render: (r) => ({ text: r.workLocation ?? "—" }),
    },
    {
      key: "status",
      label: "Status",
      width: ".8fr",
      type: "badge",
      render: () => ({ text: "Accepted" }),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Placements</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Confirmed placements, joining details and outcome analysis.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" onClick={handleExport} style={pageButtonStyle(false)}>
            Export
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
        <PlacementStatCard
          label="Students placed"
          value={placed.toLocaleString()}
          caption={`of ${totalStudents.toLocaleString()} registered`}
          progressPercent={placementPct}
        />
        <PlacementStatCard
          label="Placement percentage"
          value={`${placementPct}%`}
          delta={trendDelta != null ? `${trendDelta >= 0 ? "+" : ""}${trendDelta} pts` : undefined}
          caption={`${placed} of ${totalStudents} registered`}
        />
        <PlacementStatCard label="Average package" value={lpa(averagePackage ?? undefined)} caption="Across accepted offers" />
        <PlacementStatCard
          label="Highest package"
          value={lpa(highestRow?.offeredPackageLpa ?? highestRow?.packageLpa)}
          caption={highestRow ? `${highestRow.companyName} · ${highestRow.departmentCode ?? "—"}` : "—"}
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
              placeholder="Search placements"
              style={placementSearchInputStyle(searchFocused)}
            />
            <select value={department} onChange={(e) => resetPage(setDepartment)(e.target.value)} style={placementSelectStyle}>
              {departmentOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select value={joining} onChange={(e) => resetPage(setJoining)(e.target.value)} style={placementSelectStyle}>
              {joiningOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDepartment("All departments");
                setJoining("All joining");
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
        onRowClick={(r) => router.push(`/placement/placements/${r.id}`)}
        sort={sort}
        onSortChange={resetPage(setSort)}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage={isLoading ? "Loading…" : error ? "Failed to load placements." : "No placements match these filters."}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
        <DepartmentPlacementBars data={summary?.placementRateByDepartment ?? []} />
        <PackageBandsBarChart data={summary?.packageBands ?? []} />
      </div>
    </div>
  );
}

export default function PlacementsPage() {
  return <PlacementsContent />;
}

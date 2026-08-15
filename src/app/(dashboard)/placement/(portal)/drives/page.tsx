"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDriveReport } from "@/modules/placement/hooks/useDriveReport";
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
import type { DriveDisplayStatus, DriveReportRow } from "@/modules/placement/types";

const PAGE_SIZE = 10;

function statusLabel(status: DriveDisplayStatus): string {
  if (status === "upcoming") return "Upcoming";
  if (status === "ongoing") return "Ongoing";
  if (status === "completed") return "Completed";
  return "Cancelled";
}

function modeLabel(mode: DriveReportRow["mode"]): string {
  if (mode === "on_campus") return "On campus";
  if (mode === "virtual") return "Virtual";
  return "—";
}

function lpa(value: number | null): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function DrivesContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [status, setStatus] = useState("All statuses");
  const [mode, setMode] = useState("All modes");
  const [sort, setSort] = useState<PlacementTableSort | null>(null);
  const [page, setPage] = useState(1);
  const [resetHover, setResetHover] = useState(false);

  const { data, isLoading, error } = useDriveReport();

  function resetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const rows = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q || r.companyName.toLowerCase().includes(q) || (r.jobRole ?? "").toLowerCase().includes(q);
      const matchesStatus = status === "All statuses" || statusLabel(r.displayStatus) === status;
      const matchesMode = mode === "All modes" || modeLabel(r.mode) === mode;
      return matchesQuery && matchesStatus && matchesMode;
    });
  }, [rows, query, status, mode]);

  const now = useMemo(() => new Date(), []);
  const thisYear = rows.filter((r) => new Date(r.scheduledDate).getFullYear() === now.getFullYear()).length;
  const upcoming = rows.filter((r) => r.displayStatus === "upcoming").length;
  const ongoing = rows.filter((r) => r.displayStatus === "ongoing").length;
  const completed = rows.filter((r) => r.displayStatus === "completed").length;

  const columns: PlacementTableColumn<DriveReportRow>[] = [
    {
      key: "company",
      label: "Company",
      width: "1.1fr",
      strong: true,
      sortValue: (r) => r.companyName,
      render: (r) => ({ text: r.companyName }),
    },
    {
      key: "role",
      label: "Role",
      width: "1.3fr",
      sortValue: (r) => r.jobRole ?? "",
      render: (r) => ({ text: r.jobRole ?? "—" }),
    },
    {
      key: "date",
      label: "Date",
      width: ".9fr",
      sortValue: (r) => r.scheduledDate,
      render: (r) => ({ text: dateLabel(r.scheduledDate) }),
    },
    {
      key: "ctc",
      label: "CTC",
      width: ".8fr",
      type: "mono",
      sortValue: (r) => r.packageLpa ?? -1,
      render: (r) => ({ text: lpa(r.packageLpa) }),
    },
    {
      key: "mode",
      label: "Mode",
      width: ".8fr",
      sortValue: (r) => modeLabel(r.mode),
      render: (r) => ({ text: modeLabel(r.mode) }),
    },
    {
      key: "applied",
      label: "Applied",
      width: ".7fr",
      type: "mono",
      sortValue: (r) => r.applied,
      render: (r) => ({ text: String(r.applied) }),
    },
    {
      key: "shortlisted",
      label: "Shortlisted",
      width: ".9fr",
      type: "mono",
      sortValue: (r) => r.shortlisted,
      render: (r) => ({ text: String(r.shortlisted) }),
    },
    {
      key: "conversion",
      label: "Conversion",
      width: "1fr",
      type: "bar",
      sortValue: (r) => r.conversionPct,
      barValue: (r) => r.conversionPct,
    },
    {
      key: "status",
      label: "Status",
      width: ".8fr",
      type: "badge",
      sortValue: (r) => statusLabel(r.displayStatus),
      render: (r) => ({ text: statusLabel(r.displayStatus) }),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Placement Drives</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Scheduling, eligibility cut-offs and round-wise progress for each drive.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" onClick={() => router.push("/placement/drives/new")} style={pageButtonStyle(true)}>
            Add drive
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
        <PlacementStatCard label="Drives this year" value={thisYear.toLocaleString()} caption="Completed and scheduled" />
        <PlacementStatCard label="Upcoming" value={upcoming.toLocaleString()} caption="Next 30 days" />
        <PlacementStatCard label="Ongoing" value={ongoing.toLocaleString()} caption="Rounds in progress" />
        <PlacementStatCard label="Completed" value={completed.toLocaleString()} caption="Results published" />
      </div>

      <PlacementTable
        toolbar={
          <>
            <input
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search placement drives"
              style={placementSearchInputStyle(searchFocused)}
            />
            <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} style={placementSelectStyle}>
              {["All statuses", "Upcoming", "Ongoing", "Completed", "Cancelled"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select value={mode} onChange={(e) => resetPage(setMode)(e.target.value)} style={placementSelectStyle}>
              {["All modes", "On campus", "Virtual"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("All statuses");
                setMode("All modes");
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
        onRowClick={(r) => router.push(`/placement/drives/${r.id}`)}
        sort={sort}
        onSortChange={resetPage(setSort)}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage={isLoading ? "Loading…" : error ? "Failed to load placement drives." : "No drives match these filters."}
      />
    </div>
  );
}

export default function PlacementDrivesPage() {
  return <DrivesContent />;
}

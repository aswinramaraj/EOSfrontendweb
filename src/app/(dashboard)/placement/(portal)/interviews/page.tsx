"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useInterviews } from "@/modules/placement/hooks/useInterviews";
import { PlacementStatCard } from "@/modules/placement/components/PlacementStatCard";
import { ScheduleInterviewModal } from "@/modules/placement/components/interviews/ScheduleInterviewModal";
import { RecordResultModal } from "@/modules/placement/components/interviews/RecordResultModal";
import {
  PlacementTable,
  placementResetButtonStyle,
  placementSearchInputStyle,
  placementSelectStyle,
  type PlacementTableColumn,
  type PlacementTableSort,
} from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import type { ApplicationStatus, InterviewRow, InterviewStatus } from "@/modules/placement/types";

const PAGE_SIZE = 10;

function statusLabel(status: InterviewStatus): string {
  if (status === "scheduled") return "Scheduled";
  if (status === "in_progress") return "In progress";
  return "Completed";
}

function resultLabel(status: ApplicationStatus | null): string {
  if (status === "placed") return "Selected";
  if (status === "rejected") return "Rejected";
  if (status === "r1_cleared" || status === "r2_cleared" || status === "r3_cleared") return "In process";
  return "Pending";
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

function InterviewsContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [status, setStatus] = useState("All statuses");
  const [department, setDepartment] = useState("All departments");
  const [sort, setSort] = useState<PlacementTableSort | null>(null);
  const [page, setPage] = useState(1);
  const [resetHover, setResetHover] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<InterviewRow | "new" | null>(null);
  const [resultTarget, setResultTarget] = useState<InterviewRow | null>(null);

  const { data, isLoading, error } = useInterviews();

  function resetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const rows = useMemo(() => data ?? [], [data]);

  const departmentOptions = useMemo(() => {
    const codes = new Set(rows.map((r) => r.departmentCode).filter((c): c is string => !!c));
    return ["All departments", ...Array.from(codes).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q || r.studentName.toLowerCase().includes(q) || r.companyName.toLowerCase().includes(q);
      const matchesStatus = status === "All statuses" || statusLabel(r.status) === status;
      const matchesDept = department === "All departments" || r.departmentCode === department;
      return matchesQuery && matchesStatus && matchesDept;
    });
  }, [rows, query, status, department]);

  const now = useMemo(() => new Date(), []);
  const scheduledToday = rows.filter((r) => isSameDay(new Date(r.interviewDate), now) && r.status !== "completed").length;
  const in48Hours = useMemo(() => {
    const twoDaysOut = new Date(now);
    twoDaysOut.setDate(twoDaysOut.getDate() + 2);
    return rows.filter((r) => {
      const d = new Date(r.interviewDate);
      return d > now && d <= twoDaysOut && r.status !== "completed";
    }).length;
  }, [rows, now]);
  const selected = rows.filter((r) => r.applicationStatus === "placed").length;
  const roundsCompleted = rows.filter((r) => r.status === "completed").length;

  function handleExportSchedule() {
    const header = ["Student", "Company", "Role", "Round", "Slot", "Panel", "Status", "Result"];
    const body = filtered.map((r) => [
      r.studentName,
      r.companyName,
      r.jobRole ?? "—",
      r.roundLabel,
      r.slotLabel,
      r.panelMember,
      statusLabel(r.status),
      resultLabel(r.applicationStatus),
    ]);
    downloadCsv("interview-schedule.csv", [header, ...body]);
  }

  const columns: PlacementTableColumn<InterviewRow>[] = [
    {
      key: "student",
      label: "Student",
      width: "1.1fr",
      strong: true,
      sortValue: (r) => r.studentName,
      render: (r) => ({ text: r.studentName }),
    },
    {
      key: "company",
      label: "Company",
      width: "1fr",
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
      key: "round",
      label: "Round",
      width: ".9fr",
      sortValue: (r) => r.roundLabel,
      render: (r) => ({ text: r.roundLabel }),
    },
    {
      key: "slot",
      label: "Slot",
      width: "1fr",
      sortValue: (r) => r.slotLabel,
      render: (r) => ({ text: r.slotLabel }),
    },
    {
      key: "panel",
      label: "Panel",
      width: ".9fr",
      sortValue: (r) => r.panelMember,
      render: (r) => ({ text: r.panelMember }),
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
      key: "result",
      label: "Result",
      width: ".8fr",
      sortValue: (r) => resultLabel(r.applicationStatus),
      render: (r) => ({ text: resultLabel(r.applicationStatus) }),
    },
    {
      key: "actions",
      label: "",
      width: "1.4fr",
      type: "action",
      align: "right",
      actions: (r) => [
        { label: "Record result", tone: "primary", onClick: () => setResultTarget(r) },
        { label: "Reschedule", onClick: () => setScheduleTarget(r) },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Interviews</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Panel allotment and round-wise interview outcomes.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" onClick={handleExportSchedule} style={pageButtonStyle(false)}>
            Export schedule
          </button>
          <button type="button" onClick={() => setScheduleTarget("new")} style={pageButtonStyle(true)}>
            Schedule interview
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
        <PlacementStatCard label="Scheduled today" value={scheduledToday.toLocaleString()} caption="Panels active today" />
        <PlacementStatCard label="Upcoming" value={in48Hours.toLocaleString()} caption="Next 48 hours" />
        <PlacementStatCard label="Selected" value={selected.toLocaleString()} caption="Awaiting offer release" />
        <PlacementStatCard label="Rounds completed" value={roundsCompleted.toLocaleString()} caption="Results recorded" />
      </div>

      <PlacementTable
        toolbar={
          <>
            <input
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search interviews"
              style={placementSearchInputStyle(searchFocused)}
            />
            <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} style={placementSelectStyle}>
              {["All statuses", "Scheduled", "In progress", "Completed"].map((s) => (
                <option key={s} value={s}>
                  {s}
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
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("All statuses");
                setDepartment("All departments");
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
        onRowClick={(r) => router.push(`/placement/interviews/${r.id}`)}
        sort={sort}
        onSortChange={resetPage(setSort)}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage={isLoading ? "Loading…" : error ? "Failed to load interviews." : "No interviews match these filters."}
      />

      <ScheduleInterviewModal
        open={scheduleTarget !== null}
        interview={scheduleTarget === "new" || scheduleTarget === null ? null : scheduleTarget}
        onClose={() => setScheduleTarget(null)}
      />

      <RecordResultModal open={resultTarget !== null} interview={resultTarget} onClose={() => setResultTarget(null)} />
    </div>
  );
}

export default function InterviewsPage() {
  return <InterviewsContent />;
}

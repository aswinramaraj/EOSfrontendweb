"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useOffers } from "@/modules/placement/hooks/useOffers";
import { PlacementStatCard } from "@/modules/placement/components/PlacementStatCard";
import { UpdateOfferModal } from "@/modules/placement/components/offers/UpdateOfferModal";
import {
  PlacementTable,
  placementResetButtonStyle,
  placementSearchInputStyle,
  placementSelectStyle,
  type PlacementTableColumn,
  type PlacementTableSort,
} from "@/modules/placement/components/table/PlacementTable";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import type { Offer, OfferResponseStatus } from "@/modules/placement/types";

const PAGE_SIZE = 10;

function statusLabel(response: OfferResponseStatus | null): string {
  if (response === "accepted") return "Accepted";
  if (response === "declined") return "Declined";
  return "Pending";
}

function lpa(value: number | undefined): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
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

function OffersContent() {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [status, setStatus] = useState("All statuses");
  const [department, setDepartment] = useState("All departments");
  const [sort, setSort] = useState<PlacementTableSort | null>(null);
  const [page, setPage] = useState(1);
  const [resetHover, setResetHover] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<Offer | null>(null);

  const { data, isLoading, error } = useOffers();
  const { show } = useToast();

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
        !q || (r.studentName ?? r.studentIdNo).toLowerCase().includes(q) || r.companyName.toLowerCase().includes(q);
      const matchesStatus = status === "All statuses" || statusLabel(r.offerResponse) === status;
      const matchesDept = department === "All departments" || r.departmentCode === department;
      return matchesQuery && matchesStatus && matchesDept;
    });
  }, [rows, query, status, department]);

  const total = rows.length;
  const accepted = rows.filter((r) => r.offerResponse === "accepted").length;
  const declined = rows.filter((r) => r.offerResponse === "declined").length;
  const pending = total - accepted - declined;
  const acceptedPct = total > 0 ? Math.round((accepted / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;

  function handleExport() {
    const header = ["Student", "Register number", "Company", "Role", "CTC", "Released", "Status"];
    const body = filtered.map((r) => [
      r.studentName ?? r.studentIdNo,
      r.registerNo ?? r.rollNo ?? r.studentIdNo,
      r.companyName,
      r.jobRole ?? "—",
      lpa(r.offeredPackageLpa ?? r.packageLpa),
      dateLabel(r.releasedAt),
      statusLabel(r.offerResponse),
    ]);
    downloadCsv("offers.csv", [header, ...body]);
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
      key: "ctc",
      label: "CTC",
      width: ".8fr",
      type: "mono",
      sortValue: (r) => r.offeredPackageLpa ?? r.packageLpa ?? -1,
      render: (r) => ({ text: lpa(r.offeredPackageLpa ?? r.packageLpa) }),
    },
    {
      key: "released",
      label: "Released",
      width: "1fr",
      sortValue: (r) => r.releasedAt,
      render: (r) => ({ text: dateLabel(r.releasedAt) }),
    },
    {
      key: "status",
      label: "Status",
      width: ".9fr",
      type: "badge",
      sortValue: (r) => statusLabel(r.offerResponse),
      render: (r) => ({ text: statusLabel(r.offerResponse) }),
    },
    {
      key: "actions",
      label: "",
      width: "1fr",
      type: "action",
      align: "right",
      actions: (r) => [
        { label: "Update", tone: "primary", onClick: () => setUpdateTarget(r) },
        { label: "Letter", onClick: () => show("No offer letter uploaded yet.", "error") },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Offers</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Offer letters released, accepted and declined this cycle.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" onClick={handleExport} style={pageButtonStyle(false)}>
            Export
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
        <PlacementStatCard label="Offers released" value={total.toLocaleString()} caption="Including multiple offers per student" />
        <PlacementStatCard label="Accepted" value={accepted.toLocaleString()} caption={`${acceptedPct}% acceptance`} progressPercent={acceptedPct} />
        <PlacementStatCard label="Pending response" value={pending.toLocaleString()} caption={`${pendingPct}% of offers`} progressPercent={pendingPct} />
        <PlacementStatCard label="Declined" value={declined.toLocaleString()} caption={`${total > 0 ? Math.round((declined / total) * 100) : 0}% of offers`} />
      </div>

      <PlacementTable
        toolbar={
          <>
            <input
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search offers"
              style={placementSearchInputStyle(searchFocused)}
            />
            <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} style={placementSelectStyle}>
              {["All statuses", "Accepted", "Pending", "Declined"].map((s) => (
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
        sort={sort}
        onSortChange={resetPage(setSort)}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage={isLoading ? "Loading…" : error ? "Failed to load offers." : "No offers match these filters."}
      />

      <UpdateOfferModal open={updateTarget !== null} offer={updateTarget} onClose={() => setUpdateTarget(null)} />
    </div>
  );
}

export default function OffersPage() {
  return <OffersContent />;
}

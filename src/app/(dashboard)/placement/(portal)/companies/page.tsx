"use client";

import { useMemo, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useCompanyReport } from "@/modules/placement/hooks/useCompanyReport";
import { useDeleteCompany } from "@/modules/placement/hooks/useCompanyMutations";
import { CompanyFormModal } from "@/modules/placement/components/companies/CompanyFormModal";
import { CompanyDetailModal } from "@/modules/placement/components/companies/CompanyDetailModal";
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
import { COMPANY_INDUSTRIES, type Company, type CompanyReportRow, type RecruiterStatus } from "@/modules/placement/types";

const PAGE_SIZE = 10;

function statusLabel(status: RecruiterStatus): string {
  if (status === "returning") return "Returning";
  if (status === "new") return "New";
  return "Not yet recruited";
}

function lpa(value: number | null): string {
  return value == null ? "—" : `₹${value.toFixed(1)} LPA`;
}

function dateLabel(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function toFormCompany(row: CompanyReportRow): Company {
  return {
    id: row.id,
    name: row.name,
    profileInfo: row.profileInfo,
    createdAt: "",
    industry: row.industry,
    location: row.location,
  };
}

function CompaniesContent() {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [industry, setIndustry] = useState("All industries");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState<PlacementTableSort | null>(null);
  const [page, setPage] = useState(1);
  const [resetHover, setResetHover] = useState(false);
  const [formTarget, setFormTarget] = useState<CompanyReportRow | "new" | null>(null);
  const [viewTarget, setViewTarget] = useState<CompanyReportRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompanyReportRow | null>(null);

  const { data, isLoading, error } = useCompanyReport();
  const { show } = useToast();
  const deleteCompany = useDeleteCompany();

  function resetPage<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteCompany.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Company deleted.", "success");
        setDeleteTarget(null);
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  const rows = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q) || (r.profileInfo ?? "").toLowerCase().includes(q);
      const matchesIndustry = industry === "All industries" || r.industry === industry;
      const matchesStatus = status === "All statuses" || statusLabel(r.recruiterStatus) === status;
      return matchesQuery && matchesIndustry && matchesStatus;
    });
  }, [rows, query, industry, status]);

  const total = rows.length;
  const withDrives = rows.filter((r) => r.drivesCount > 0).length;
  const hiringThisCycle = rows.filter((r) => r.openRoles > 0);
  const returningHiring = hiringThisCycle.filter((r) => r.recruiterStatus === "returning").length;
  const newHiring = hiringThisCycle.filter((r) => r.recruiterStatus === "new").length;
  const offersMade = rows.reduce((a, r) => a + r.hired, 0);
  const packageSum = rows.reduce((a, r) => a + (r.averagePackageLpa ?? 0) * r.hired, 0);
  const averagePackage = offersMade > 0 ? packageSum / offersMade : null;

  const columns: PlacementTableColumn<CompanyReportRow>[] = [
    {
      key: "name",
      label: "Company",
      width: "1.2fr",
      strong: true,
      sortValue: (r) => r.name,
      render: (r) => ({ text: r.name }),
    },
    {
      key: "industry",
      label: "Industry",
      width: "1fr",
      sortValue: (r) => r.industry ?? "",
      render: (r) => ({ text: r.industry ?? "—" }),
    },
    {
      key: "location",
      label: "Location",
      width: ".9fr",
      sortValue: (r) => r.location ?? "",
      render: (r) => ({ text: r.location ?? "—" }),
    },
    {
      key: "openRoles",
      label: "Open roles",
      width: ".7fr",
      type: "mono",
      sortValue: (r) => r.openRoles,
      render: (r) => ({ text: String(r.openRoles) }),
    },
    {
      key: "hired",
      label: "Hired",
      width: ".7fr",
      type: "mono",
      sortValue: (r) => r.hired,
      render: (r) => ({ text: String(r.hired) }),
    },
    {
      key: "average",
      label: "Average",
      width: ".9fr",
      type: "mono",
      sortValue: (r) => r.averagePackageLpa ?? -1,
      render: (r) => ({ text: lpa(r.averagePackageLpa) }),
    },
    {
      key: "highest",
      label: "Highest",
      width: ".9fr",
      type: "mono",
      sortValue: (r) => r.highestPackageLpa ?? -1,
      render: (r) => ({ text: lpa(r.highestPackageLpa) }),
    },
    {
      key: "lastDrive",
      label: "Last drive",
      width: "1fr",
      sortValue: (r) => r.lastDriveDate ?? "",
      render: (r) => ({ text: dateLabel(r.lastDriveDate) }),
    },
    {
      key: "status",
      label: "Status",
      width: ".8fr",
      type: "badge",
      sortValue: (r) => statusLabel(r.recruiterStatus),
      render: (r) => ({ text: statusLabel(r.recruiterStatus) }),
    },
    {
      key: "actions",
      label: "",
      width: "1.2fr",
      type: "action",
      align: "right",
      actions: (r) => [
        { label: "View", onClick: () => setViewTarget(r) },
        { label: "Edit", onClick: () => setFormTarget(r) },
        { label: "Delete", tone: "danger", onClick: () => setDeleteTarget(r) },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-.7px", fontWeight: 680 }}>Companies</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: 13, color: "#77808f" }}>
            Recruiter relationships, hiring history and drive participation across {total.toLocaleString()} companies.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" onClick={() => setFormTarget("new")} style={pageButtonStyle(true)}>
            Add company
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(206px,1fr))", gap: 12 }}>
        <PlacementStatCard
          label="Companies in directory"
          value={total.toLocaleString()}
          caption={`${withDrives} with at least one drive on record`}
        />
        <PlacementStatCard
          label="Hiring this cycle"
          value={hiringThisCycle.length.toLocaleString()}
          caption={`${returningHiring} returning, ${newHiring} first-time`}
        />
        <PlacementStatCard label="Offers made" value={offersMade.toLocaleString()} caption="Across all recruiters" />
        <PlacementStatCard label="Average package" value={lpa(averagePackage)} caption="Weighted across all hired students" />
      </div>

      <PlacementTable
        toolbar={
          <>
            <input
              value={query}
              onChange={(e) => resetPage(setQuery)(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search companies"
              style={placementSearchInputStyle(searchFocused)}
            />
            <select value={industry} onChange={(e) => resetPage(setIndustry)(e.target.value)} style={placementSelectStyle}>
              {["All industries", ...COMPANY_INDUSTRIES].map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => resetPage(setStatus)(e.target.value)} style={placementSelectStyle}>
              {["All statuses", "Returning", "New", "Not yet recruited"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIndustry("All industries");
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
        onRowClick={setViewTarget}
        sort={sort}
        onSortChange={resetPage(setSort)}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        emptyMessage={isLoading ? "Loading…" : error ? "Failed to load companies." : "No companies match these filters."}
      />

      <CompanyFormModal
        open={formTarget !== null}
        company={formTarget === "new" || formTarget === null ? null : toFormCompany(formTarget)}
        onClose={() => setFormTarget(null)}
      />

      <CompanyDetailModal
        open={viewTarget !== null}
        company={viewTarget ? toFormCompany(viewTarget) : null}
        onClose={() => setViewTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete company"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteCompany.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default function CompaniesPage() {
  return <CompaniesContent />;
}

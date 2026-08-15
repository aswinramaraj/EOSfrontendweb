"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { usePayslipRequests } from "@/modules/hr/hooks/usePayslipRequests";
import { PayslipDecisionModal } from "@/modules/hr/components/PayslipDecisionModal";
import type { PayslipRequest, PayslipRequestStatus } from "@/modules/hr/types/api";

const ALL = "all";
type Tab = "all" | PayslipRequestStatus;

const STATUS_LABEL: Record<PayslipRequestStatus, string> = {
  pending: "Pending",
  processed: "Processed",
  rejected: "Rejected",
};

const STATUS_TONE: Record<PayslipRequestStatus, PillTone> = {
  pending: "amber",
  processed: "green",
  rejected: "red",
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - i);
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const label = date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  return { value, label };
});

function formatRequestedDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function HRPayslipRequestsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(ALL);
  const [decision, setDecision] = useState<{ request: PayslipRequest; action: "processed" | "rejected" } | null>(null);

  const { data, isLoading, error } = usePayslipRequests({
    month: month !== ALL ? month : undefined,
    limit: 100,
  });

  const allRequests = useMemo(() => data?.data ?? [], [data]);

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(
    () => [
      { key: "all", label: "All", count: allRequests.length },
      { key: "pending", label: "Pending", count: allRequests.filter((r) => r.status === "pending").length },
      { key: "processed", label: "Processed", count: allRequests.filter((r) => r.status === "processed").length },
      { key: "rejected", label: "Rejected", count: allRequests.filter((r) => r.status === "rejected").length },
    ],
    [allRequests],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRequests.filter((request) => {
      if (activeTab !== "all" && request.status !== activeTab) return false;
      if (query && !fullName(request.faculty).toLowerCase().includes(query)) return false;
      return true;
    });
  }, [allRequests, activeTab, search]);

  function resetFilters() {
    setSearch("");
    setMonth(ALL);
  }

  return (
    <div>
      <PageHeader
        title="Payslip Requests"
        description="Faculty requests for a payslip — approve to let them generate it themselves, or reject it."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load payslip requests."}
        </p>
      )}

      <div className="mb-5 inline-flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {tab.label}
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
                activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput placeholder="Search faculty..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <SelectInput className="sm:w-52" value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value={ALL}>All Months</option>
          {MONTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectInput>
        <button onClick={resetFilters} className="text-sm font-medium text-blue-700 hover:text-blue-800">
          Reset Filters
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        {isLoading && <p className="px-5 py-10 text-center text-sm text-slate-500">Loading…</p>}
        {!isLoading &&
          filtered.map((request) => (
            <div key={request.id} className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 last:border-b-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{fullName(request.faculty)}</p>
                    <StatusPill tone="slate">{request.faculty.department.name}</StatusPill>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Payslip for {request.month} · Requested {formatRequestedDate(request.requested_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</StatusPill>
                  {request.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDecision({ request, action: "rejected" })}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setDecision({ request, action: "processed" })}
                        className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                  {request.status === "processed" && request.file_url && (
                    <a
                      href={request.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-blue-700 hover:text-blue-800"
                    >
                      View Payslip
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

        {!isLoading && filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No payslip requests match these filters.</p>
        )}
      </div>

      <PayslipDecisionModal
        request={decision?.request ?? null}
        action={decision?.action ?? null}
        onClose={() => setDecision(null)}
      />
    </div>
  );
}

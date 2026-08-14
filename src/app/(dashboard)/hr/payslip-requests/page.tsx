"use client";

import { useMemo, useState } from "react";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { CheckIcon, FileTextIcon, InboxIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { usePayslipRequests } from "@/modules/hr/hooks/usePayslipRequests";
import { PayslipDecisionModal } from "@/modules/hr/components/PayslipDecisionModal";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRListRowsSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
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

  const pendingCount = allRequests.filter((r) => r.status === "pending").length;
  const correctionsCount = allRequests.filter((r) => r.purpose?.toLowerCase().includes("correction")).length;
  const certificatesCount = allRequests.filter((r) => r.purpose?.toLowerCase().includes("certificate")).length;
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const closedThisMonth = allRequests.filter(
    (r) => r.status !== "pending" && r.requested_at.slice(0, 7) === currentMonthKey,
  ).length;

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
    setActiveTab("all");
  }

  return (
    <div>
      <HRPageHeader
        title="Payslip Requests"
        description="Corrections, reissues and salary certificates raised by employees."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load payslip requests."}
        </p>
      )}

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <HRStatCard icon={InboxIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Open requests" value={pendingCount} />
        <HRStatCard icon={FileTextIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Corrections" value={correctionsCount} />
        <HRStatCard icon={FileTextIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Salary certificates" value={certificatesCount} />
        <HRStatCard icon={CheckIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Closed this month" value={closedThisMonth} />
      </div>

      <div className="mb-5">
        <HRSegmentedTabs
          value={activeTab}
          onChange={setActiveTab}
          options={tabs.map((t) => ({ value: t.key, label: t.label, count: t.count }))}
        />
      </div>

      <HRFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee or request type…"
        onReset={resetFilters}
        resultCount={{ showing: filtered.length, total: allRequests.length, noun: "records" }}
        filters={
          <SelectInput className="w-auto" value={month} onChange={(e) => setMonth(e.target.value)}>
            <option value={ALL}>All Months</option>
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectInput>
        }
      />

      {isLoading && <HRListRowsSkeleton rows={5} />}

      {!isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white">
          {filtered.map((request) => (
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
                      <Button variant="secondary" size="sm" onClick={() => setDecision({ request, action: "rejected" })}>
                        Reject
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setDecision({ request, action: "processed" })}>
                        Approve
                      </Button>
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

          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No payslip requests match these filters.</p>
          )}
        </div>
      )}

      <PayslipDecisionModal
        request={decision?.request ?? null}
        action={decision?.action ?? null}
        onClose={() => setDecision(null)}
      />
    </div>
  );
}

"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { DownloadIcon, ChevronDownIcon, InboxIcon, CheckIcon, XIcon, ClockIcon } from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { RequestListItem } from "@/modules/hr/components/RequestListItem";
import { RequestDetailDrawer } from "@/modules/hr/components/RequestDetailDrawer";
import { useHrRequests, useHrRequestDecision } from "@/modules/hr/hooks/useHrRequests";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRStatCard } from "@/modules/hr/components/HRStatCard";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRStatGridSkeleton, HRListRowsSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import { exportHrRequestsPdf } from "@/modules/hr/lib/hr-report-pdfs";
import type { HrUnifiedRequest } from "@/modules/hr/types/api";

const ALL = "all";

type Tab = "all" | "pending" | "approved" | "rejected";
const VALID_TABS: Tab[] = ["all", "pending", "approved", "rejected"];

export default function HRRequestsPage() {
  return (
    <Suspense fallback={null}>
      <HRRequestsPageContent />
    </Suspense>
  );
}

function HRRequestsPageContent() {
  const { show } = useToast();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab: Tab = VALID_TABS.includes(requestedTab as Tab) ? (requestedTab as Tab) : "all";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState(ALL);
  const [selectedRequest, setSelectedRequest] = useState<HrUnifiedRequest | null>(null);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [nowMs] = useState(() => Date.now());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportPending, setExportPending] = useState(false);
  const [bulkActionPending, setBulkActionPending] = useState(false);
  const decision = useHrRequestDecision();

  const { data: departments } = useDepartments();
  const { data, isLoading, error } = useHrRequests({
    department_id: departmentId !== ALL ? Number(departmentId) : undefined,
    limit: 100,
  });

  const allRequests = useMemo(() => data?.data ?? [], [data]);
  const departmentLabel = departmentId !== ALL ? departments?.find((d) => String(d.id) === departmentId)?.name : undefined;

  const pendingOnHr = useMemo(
    () => allRequests.filter((r) => r.hod_approval_status === "approved" && r.hr_approval_status === "pending"),
    [allRequests],
  );
  const approvedCount = allRequests.filter((r) => r.overall_status === "approved").length;
  const rejectedCount = allRequests.filter((r) => r.overall_status === "rejected").length;
  const slaBreaches = pendingOnHr.filter((r) => nowMs - new Date(r.created_at).getTime() > 48 * 60 * 60 * 1000);

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(
    () => [
      { key: "all", label: "All", count: allRequests.length },
      { key: "pending", label: "Pending on HR", count: pendingOnHr.length },
      { key: "approved", label: "Approved", count: approvedCount },
      { key: "rejected", label: "Rejected", count: rejectedCount },
    ],
    [allRequests, pendingOnHr, approvedCount, rejectedCount],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRequests.filter((request) => {
      if (activeTab === "pending" && !(request.hod_approval_status === "approved" && request.hr_approval_status === "pending")) {
        return false;
      }
      if (activeTab === "approved" && request.overall_status !== "approved") return false;
      if (activeTab === "rejected" && request.overall_status !== "rejected") return false;
      if (query && !fullName(request.faculty).toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [allRequests, activeTab, search]);

  function resetFilters() {
    setSearch("");
    setDepartmentId(ALL);
    setActiveTab("all");
  }

  function toggleSelect(request: HrUnifiedRequest) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(request.id)) next.delete(request.id);
      else next.add(request.id);
      return next;
    });
  }

  const tabLabel = tabs.find((t) => t.key === activeTab)?.label;

  async function handleExport(rows: HrUnifiedRequest[], label: string) {
    if (rows.length === 0) {
      show(`No requests to export for ${label}.`, "info");
      return;
    }
    setExportPending(true);
    try {
      await exportHrRequestsPdf(rows, {
        title: label,
        filenameSlug: "hr-requests",
        department: departmentLabel,
        status: activeTab !== "all" ? tabLabel : undefined,
      });
      show(`${label} exported.`, "success");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't generate the export.", "error");
    } finally {
      setExportPending(false);
    }
  }

  async function handleBulkDecision(action: "approved" | "rejected") {
    const rows = allRequests.filter((r) => selectedIds.has(r.id) && pendingOnHr.some((p) => p.id === r.id));
    if (rows.length === 0) {
      show("Select at least one request that's pending on HR.", "info");
      return;
    }
    setBulkActionPending(true);
    try {
      for (const request of rows) {
        await decision.mutateAsync({ kind: request.kind, sourceId: request.source_id, decision: action });
      }
      show(`${rows.length} request${rows.length === 1 ? "" : "s"} ${action}.`, action === "approved" ? "success" : "info");
      setSelectedIds(new Set());
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Some requests couldn't be updated.", "error");
    } finally {
      setBulkActionPending(false);
    }
  }

  return (
    <div>
      <HRPageHeader
        title="Requests"
        description="Leave, OD and comp-off requests with full HOD → HR workflow tracking."
        actions={
          <>
            <Button variant="secondary" isPending={exportPending} onClick={() => handleExport(filtered, tabLabel ?? "Requests")}>
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            <div className="relative">
              <Button variant="primary" onClick={() => setBulkMenuOpen((o) => !o)}>
                Bulk approve
                {selectedIds.size > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-blue-700">
                    {selectedIds.size}
                  </span>
                )}
                <ChevronDownIcon className="h-4 w-4" />
              </Button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    disabled={bulkActionPending}
                    onClick={() => {
                      setBulkMenuOpen(false);
                      handleBulkDecision("approved");
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Approve selected
                  </button>
                  <button
                    disabled={bulkActionPending}
                    onClick={() => {
                      setBulkMenuOpen(false);
                      handleBulkDecision("rejected");
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Reject selected
                  </button>
                  <button
                    disabled={exportPending}
                    onClick={() => {
                      setBulkMenuOpen(false);
                      handleExport(
                        allRequests.filter((r) => selectedIds.has(r.id)),
                        "Selected Requests",
                      );
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Export selected
                  </button>
                </div>
              )}
            </div>
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load requests."}
        </p>
      )}

      {isLoading ? (
        <div className="mb-5">
          <HRStatGridSkeleton count={4} />
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <HRStatCard icon={InboxIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="All requests" value={allRequests.length} caption="This academic month" />
          <HRStatCard icon={ClockIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Pending on HR" value={pendingOnHr.length} />
          <HRStatCard icon={CheckIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Approved" value={approvedCount} />
          <HRStatCard icon={XIcon} iconClassName="bg-[#EEF2FF] text-[#2655DA]" label="Rejected" value={rejectedCount} />
        </div>
      )}

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
        searchPlaceholder="Search faculty, request type or reason…"
        onReset={resetFilters}
        resultCount={{ showing: filtered.length, total: allRequests.length, noun: "records" }}
        filters={
          <SelectInput className="w-auto" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value={ALL}>All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </SelectInput>
        }
      />

      {selectedIds.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-900">{selectedIds.size} request{selectedIds.size === 1 ? "" : "s"} selected</p>
          <button onClick={() => setSelectedIds(new Set())} className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Clear selection
          </button>
        </div>
      )}

      {isLoading && <HRListRowsSkeleton rows={5} />}

      {!isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white">
          {filtered.map((request, index) => (
            <RequestListItem
              key={request.id}
              request={request}
              index={index}
              onOpen={setSelectedRequest}
              selectable
              selected={selectedIds.has(request.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">No requests match these filters.</p>
          )}
        </div>
      )}

      <p className="mt-5 text-xs text-slate-400">
        SLA: HR must act within 48 hours of HOD approval · {slaBreaches.length} request{slaBreaches.length === 1 ? "" : "s"} past SLA.
      </p>

      <RequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}

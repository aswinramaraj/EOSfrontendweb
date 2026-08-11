"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { DownloadIcon, ChevronDownIcon } from "@/shared/components/icons";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { RequestListItem } from "@/modules/hr/components/RequestListItem";
import { RequestDetailDrawer } from "@/modules/hr/components/RequestDetailDrawer";
import { useHrRequests } from "@/modules/hr/hooks/useHrRequests";
import type { HrUnifiedRequest } from "@/modules/hr/types/api";

const ALL = "all";

type Tab = "all" | "leave" | "od" | "pending" | "approved" | "rejected";
const VALID_TABS: Tab[] = ["all", "leave", "od", "pending", "approved", "rejected"];

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

  const { data: departments } = useDepartments();
  // A single roomy fetch (backend caps `limit` at 100), filtered/tab-counted
  // client-side rather than juggling six separate count queries for the tab bar.
  const { data, isLoading, error } = useHrRequests({
    department_id: departmentId !== ALL ? Number(departmentId) : undefined,
    limit: 100,
  });

  const allRequests = useMemo(() => data?.data ?? [], [data]);

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(
    () => [
      { key: "all", label: "All", count: allRequests.length },
      { key: "leave", label: "Leave", count: allRequests.filter((r) => r.kind === "leave").length },
      { key: "od", label: "OD", count: allRequests.filter((r) => r.kind === "od").length },
      { key: "pending", label: "Pending", count: allRequests.filter((r) => r.overall_status === "pending").length },
      { key: "approved", label: "Approved", count: allRequests.filter((r) => r.overall_status === "approved").length },
      { key: "rejected", label: "Rejected", count: allRequests.filter((r) => r.overall_status === "rejected").length },
    ],
    [allRequests],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRequests.filter((request) => {
      if (activeTab === "leave" && request.kind !== "leave") return false;
      if (activeTab === "od" && request.kind !== "od") return false;
      if (["pending", "approved", "rejected"].includes(activeTab) && request.overall_status !== activeTab) {
        return false;
      }
      if (query && !fullName(request.faculty).toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [allRequests, activeTab, search]);

  function resetFilters() {
    setSearch("");
    setDepartmentId(ALL);
  }

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Manage leave and on-duty requests with full workflow tracking."
        actions={
          <>
            <button
              onClick={() => show("Export is coming soon.", "info")}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
            <div className="relative">
              <button
                onClick={() => setBulkMenuOpen((o) => !o)}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Bulk Actions
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                  {["Approve selected", "Reject selected", "Export selected"].map((label) => (
                    <button
                      key={label}
                      onClick={() => {
                        setBulkMenuOpen(false);
                        show(`${label} is coming soon.`, "info");
                      }}
                      className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    >
                      {label}
                    </button>
                  ))}
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
          <SearchInput
            placeholder="Search faculty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <SelectInput className="sm:w-40" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value={ALL}>All Depts</option>
          {departments?.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.name}
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
          filtered.map((request, index) => (
            <RequestListItem key={request.id} request={request} index={index} onOpen={setSelectedRequest} />
          ))}
        {!isLoading && filtered.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No requests match these filters.</p>
        )}
      </div>

      <RequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}

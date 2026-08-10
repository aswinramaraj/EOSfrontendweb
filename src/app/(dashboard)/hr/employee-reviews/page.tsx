"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ChevronRightIcon, DownloadIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { CircularScore } from "@/modules/hr/components/CircularScore";
import { AppraisalRequestDetailDrawer } from "@/modules/hr/components/AppraisalRequestDetailDrawer";
import { useAppraisalRequests } from "@/modules/hr/hooks/useAppraisalRequests";
import type { AppraisalRequest, AppraisalRequestStatus } from "@/modules/hr/types/api";

const ALL = "all";
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const startYear = CURRENT_YEAR - i;
  return `${startYear}-${startYear + 1}`;
});

type Tab = "all" | AppraisalRequestStatus;
const VALID_TABS: Tab[] = ["all", "submitted", "hod_reviewed", "hr_scored", "management_approved", "rejected"];

const STATUS_LABEL: Record<AppraisalRequestStatus, string> = {
  submitted: "Submitted",
  hod_reviewed: "HOD Reviewed",
  hr_scored: "HR Scored",
  management_approved: "Approved",
  rejected: "Rejected",
};

const STATUS_TONE: Record<AppraisalRequestStatus, PillTone> = {
  submitted: "slate",
  hod_reviewed: "blue",
  hr_scored: "amber",
  management_approved: "green",
  rejected: "red",
};

function reviewScore(request: AppraisalRequest) {
  const totalMax = request.entries.reduce((sum, entry) => sum + entry.criteria.max_score, 0);
  const scoredEntries = request.entries.filter((entry) => entry.score !== null);
  const totalScore = scoredEntries.reduce((sum, entry) => sum + (entry.score ?? 0), 0);
  const completionPercent = request.entries.length
    ? Math.round((scoredEntries.length / request.entries.length) * 100)
    : 0;
  return { totalMax, totalScore, hasScores: scoredEntries.length > 0, completionPercent };
}

export default function HREmployeeReviewsPage() {
  return (
    <Suspense fallback={null}>
      <HREmployeeReviewsPageContent />
    </Suspense>
  );
}

function HREmployeeReviewsPageContent() {
  const { show } = useToast();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("status");
  const initialTab: Tab = VALID_TABS.includes(requestedTab as Tab) ? (requestedTab as Tab) : "all";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState(ALL);
  const [selectedRequest, setSelectedRequest] = useState<AppraisalRequest | null>(null);

  const { data, isLoading, error } = useAppraisalRequests({
    academic_year: academicYear !== ALL ? academicYear : undefined,
    limit: 100,
  });

  const allRequests = useMemo(() => data?.data ?? [], [data]);

  const tabs: { key: Tab; label: string; count: number }[] = useMemo(
    () => [
      { key: "all", label: "All", count: allRequests.length },
      ...(["submitted", "hod_reviewed", "hr_scored", "management_approved", "rejected"] as AppraisalRequestStatus[]).map(
        (status) => ({
          key: status,
          label: STATUS_LABEL[status],
          count: allRequests.filter((r) => r.status === status).length,
        }),
      ),
    ],
    [allRequests],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRequests.filter((request) => {
      if (activeTab !== "all" && request.status !== activeTab) return false;
      if (query && !fullName(request.faculty).toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [allRequests, activeTab, search]);

  return (
    <div>
      <PageHeader
        title="Employee Reviews"
        description="Review and finalize faculty appraisal submissions."
        actions={
          <button
            onClick={() => show("Exporting all reviews is coming soon.", "info")}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <DownloadIcon className="h-4 w-4" />
            Export All
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load reviews."}
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Reviews</p>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            placeholder="Search faculty..."
            className="w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <SelectInput className="w-36" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            <option value={ALL}>All Years</option>
            {ACADEMIC_YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>

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

      {isLoading && <p className="py-10 text-center text-sm text-slate-500">Loading…</p>}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((request) => {
            const { totalMax, totalScore, hasScores, completionPercent } = reviewScore(request);
            return (
              <div key={request.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-4">
                  {hasScores ? (
                    <CircularScore score={totalScore} maxScore={totalMax || 1} />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs text-slate-400">
                      Not scored
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-slate-900">{fullName(request.faculty)}</p>
                    <p className="text-sm text-slate-500">{request.faculty.designation}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <StatusPill tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status]}</StatusPill>
                  <span className="text-sm text-slate-500">Completion: {completionPercent}%</span>
                </div>

                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  Review Application
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-500">No reviews match these filters.</p>
          )}
        </div>
      )}

      <AppraisalRequestDetailDrawer request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </div>
  );
}

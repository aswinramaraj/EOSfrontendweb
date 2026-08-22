"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ChevronRightIcon, DownloadIcon } from "@/shared/components/icons";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { CircularScore } from "@/modules/hr/components/CircularScore";
import { useAppraisalRequests } from "@/modules/hr/hooks/useAppraisalRequests";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRSegmentedTabs } from "@/modules/hr/components/ui/HRSegmentedTabs";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HOVERABLE } from "@/modules/hr/components/ui/hoverable";
import { buildFacultyDepartmentLookup, exportAppraisalReportPdf } from "@/modules/hr/lib/hr-report-pdfs";
import { HRScoreCardsSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import { facultyService } from "@/modules/faculty/services/faculty.service";
import { fetchAllPages } from "@/modules/faculty/lib/report-export";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("status");
  const initialTab: Tab = VALID_TABS.includes(requestedTab as Tab) ? (requestedTab as Tab) : "all";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState(ALL);
  const [exportPending, setExportPending] = useState(false);

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

  function resetFilters() {
    setSearch("");
    setAcademicYear(ALL);
    setActiveTab("all");
  }

  async function handleExportAll() {
    if (filtered.length === 0) {
      show("No reviews to export for these filters.", "info");
      return;
    }
    setExportPending(true);
    try {
      const { rows: allFaculty } = await fetchAllPages((page, limit) => facultyService.list({ page, limit }));
      const deptLookup = buildFacultyDepartmentLookup(allFaculty);
      await exportAppraisalReportPdf(filtered, deptLookup, {
        department: undefined,
      });
      show("Reviews exported.", "success");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Couldn't generate the export.", "error");
    } finally {
      setExportPending(false);
    }
  }

  return (
    <div>
      <HRPageHeader
        title="Employee Reviews"
        description="Review and finalize faculty appraisal submissions."
        actions={
          <Button variant="secondary" isPending={exportPending} onClick={handleExportAll}>
            <DownloadIcon className="h-4 w-4" />
            Export All
          </Button>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load reviews."}
        </p>
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
        searchPlaceholder="Search faculty…"
        onReset={resetFilters}
        resultCount={{ showing: filtered.length, total: allRequests.length, noun: "records" }}
        filters={
          <SelectInput className="w-auto" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
            <option value={ALL}>All Years</option>
            {ACADEMIC_YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </SelectInput>
        }
      />

      {isLoading && <HRScoreCardsSkeleton count={6} />}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((request) => {
            const { totalMax, totalScore, hasScores, completionPercent } = reviewScore(request);
            return (
              <button
                key={request.id}
                onClick={() => router.push(`/hr/employee-reviews/${request.id}`)}
                className={`flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 text-left ${HOVERABLE}`}
              >
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

                <span className="flex items-center gap-1 border-t border-slate-100 pt-3 text-sm font-medium text-blue-700">
                  Review Application
                  <ChevronRightIcon className="h-4 w-4" />
                </span>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-500">No reviews match these filters.</p>
          )}
        </div>
      )}
    </div>
  );
}

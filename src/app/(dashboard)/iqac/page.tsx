"use client";

import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { BarChartIcon, CheckIcon, ClockIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useDashboardLiveStatus, useDashboardSummary } from "@/modules/iqac/hooks/useDashboard";
import { TodayVenuesList } from "@/modules/iqac/components/dashboard/TodayVenuesList";
import { LiveVenueStatusPanel } from "@/modules/iqac/components/dashboard/LiveVenueStatusPanel";
import { QuickApprovalsPanel } from "@/modules/iqac/components/dashboard/QuickApprovalsPanel";

export default function IqacDashboardPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary();
  const { data: liveStatus, isLoading: liveLoading } = useDashboardLiveStatus();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Today's venue activity and approvals awaiting your decision."
      />

      {summaryError && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {summaryError instanceof ApiError ? summaryError.message : "Failed to load the dashboard."}
        </p>
      )}

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {summaryLoading || !summary ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32.5 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
              ))
            ) : (
              <>
                <StatCard label="Today's bookings" value={summary.today_bookings} icon={BarChartIcon} />
                <StatCard label="Pending requests" value={summary.pending_requests} icon={ClockIcon} />
                <StatCard label="Available venues" value={summary.available_venues} icon={CheckIcon} />
              </>
            )}
          </div>

          <TodayVenuesList schedule={liveStatus?.schedule ?? []} isLoading={liveLoading} />
        </div>

        <div className="flex flex-col gap-4">
          <QuickApprovalsPanel />
          <LiveVenueStatusPanel venues={liveStatus?.venue_status ?? []} isLoading={liveLoading} />
        </div>
      </div>
    </div>
  );
}

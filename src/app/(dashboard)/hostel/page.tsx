"use client";

import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import {
  AlertTriangleIcon,
  BarChartIcon,
  BedIcon,
  CheckIcon,
  ClockIcon,
  PeopleIcon,
} from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useHostelDashboardSummary } from "@/modules/hostel/hooks/useDashboardSummary";

export default function HostelDashboardPage() {
  const { data, isLoading, error } = useHostelDashboardSummary();

  const tiles = data
    ? [
        { label: "Total residents", value: data.total_residents, icon: PeopleIcon },
        { label: "Currently present", value: data.currently_present, icon: CheckIcon },
        { label: "Away on leave", value: data.on_leave, icon: ClockIcon },
        { label: "Requests to decide", value: data.pending_approvals, icon: AlertTriangleIcon },
        { label: "Beds occupied", value: data.beds_occupied, icon: BedIcon },
        { label: "Beds vacant", value: data.beds_vacant, icon: BedIcon },
        { label: "Occupancy", value: `${data.occupancy_pct}%`, icon: BarChartIcon },
        { label: "Complaints open", value: data.complaints_open, icon: AlertTriangleIcon },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Priority actions, occupancy and gate movement for today."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load the dashboard."}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-32.5 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
            />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <StatCard key={tile.label} label={tile.label} value={tile.value} icon={tile.icon} />
          ))}
        </div>
      )}
    </div>
  );
}

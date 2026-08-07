"use client";

import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import {
  AlertTriangleIcon,
  BookIcon,
  FileTextIcon,
  LayersIcon,
  SwapIcon,
  TrashIcon,
} from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useDashboardSummary } from "@/modules/library/hooks/useDashboardSummary";

export default function LibraryDashboardPage() {
  const { data, isLoading, error } = useDashboardSummary();

  const tiles = data
    ? [
        { label: "Total books", value: data.total_books, icon: BookIcon },
        { label: "Available books", value: data.available_books, icon: LayersIcon },
        { label: "Total eBooks", value: data.total_ebooks, icon: FileTextIcon },
        { label: "Active borrowings", value: data.active_borrowings, icon: SwapIcon },
        { label: "Overdue books", value: data.overdue_books, icon: AlertTriangleIcon },
        { label: "Lost books", value: data.lost_books, icon: TrashIcon },
        { label: "Damaged books", value: data.damaged_books, icon: AlertTriangleIcon },
      ]
    : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live position of the collection, the counter and the fines ledger."
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load the dashboard."}
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-32.5 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
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

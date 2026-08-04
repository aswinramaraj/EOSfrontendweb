import type { ReactNode } from "react";
import type { SectionStatus } from "../types/dashboard.types";
import { ErrorCard } from "./ErrorCard";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface DashboardSectionStateProps {
  status: SectionStatus;
  error?: string | null;
  emptyMessage?: string;
  onRetry?: () => void;
  skeletonRows?: number;
  children?: ReactNode;
}

/** Thin status router in front of the shared LoadingSkeleton/ErrorCard pieces —
 * avoids repeating the same status switch in every card. */
export function DashboardSectionState({
  status,
  error,
  emptyMessage = "Nothing to show here yet.",
  onRetry,
  skeletonRows = 4,
  children,
}: DashboardSectionStateProps) {
  if (status === "loading") {
    return <LoadingSkeleton rows={skeletonRows} />;
  }

  if (status === "error") {
    return <ErrorCard message={error} onRetry={onRetry} />;
  }

  if (status === "empty") {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}

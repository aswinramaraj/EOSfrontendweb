import { memo, useMemo } from "react";
import { formatCurrency } from "../fee-payments/format";
import { ChartCard } from "./ChartCard";
import { ChartEmptyState } from "./ChartEmptyState";
import type { DepartmentOutstandingEntry } from "./types";

export const DepartmentOutstandingChart = memo(function DepartmentOutstandingChart({
  data,
}: {
  data: DepartmentOutstandingEntry[];
}) {
  // Displayed order only (ranking the same values the backend returned) —
  // no value is recomputed, only the row order for readability.
  const ranked = useMemo(() => [...data].sort((a, b) => b.totalOutstanding - a.totalOutstanding), [data]);
  const maxValue = useMemo(() => Math.max(...ranked.map((entry) => entry.totalOutstanding), 1), [ranked]);

  if (data.length === 0) {
    return (
      <ChartCard title="Department Outstanding">
        <ChartEmptyState
          label="No outstanding dues by department"
          description="Department breakdown will appear once fees are due."
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Department Outstanding">
      <div className="flex flex-col gap-5">
        {ranked.map((entry, index) => {
          const widthPercent = Math.min((entry.totalOutstanding / maxValue) * 100, 100);

          return (
            <div key={entry.department} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                style={{ background: "var(--c-danger-50)", color: "var(--c-danger-600)" }}
              >
                {index + 1}
              </span>

              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <span className="truncate text-[var(--text-secondary)]" title={entry.department}>
                    {entry.department}
                  </span>
                  <span className="shrink-0 font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatCurrency(entry.totalOutstanding)}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${entry.department} outstanding`}
                  aria-valuenow={Math.round(widthPercent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-3.5 w-full overflow-hidden rounded-full bg-[var(--c-gray-100)]"
                >
                  <div
                    className="h-full rounded-full bg-[var(--c-danger-500,#ef4444)] transition-[width] duration-700 ease-out"
                    style={{ width: `${widthPercent}%`, transitionDelay: `${index * 90}ms` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
});

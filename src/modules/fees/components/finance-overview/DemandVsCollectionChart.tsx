import { memo, useMemo } from "react";
import { formatCurrency } from "../fee-payments/format";
import { ChartCard } from "./ChartCard";
import type { DemandVsCollection } from "./types";

const ROWS: Array<{ key: keyof DemandVsCollection; label: string; color: string }> = [
  { key: "totalDemand", label: "Total Demand", color: "var(--c-primary-500)" },
  { key: "totalCollected", label: "Total Collected", color: "var(--c-success-500,#22c55e)" },
  { key: "totalOutstanding", label: "Total Outstanding", color: "var(--c-danger-500,#ef4444)" },
];

export const DemandVsCollectionChart = memo(function DemandVsCollectionChart({
  data,
}: {
  data: DemandVsCollection;
}) {
  const maxValue = useMemo(
    () => Math.max(data.totalDemand, data.totalCollected, data.totalOutstanding, 1),
    [data.totalDemand, data.totalCollected, data.totalOutstanding],
  );

  return (
    <ChartCard title="Demand vs Collection">
      <div className="flex flex-col gap-5">
        {ROWS.map((row, index) => {
          const value = data[row.key];
          const widthPercent = Math.min((value / maxValue) * 100, 100);

          return (
            <div key={row.key} className="group flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ background: row.color }} />
                  {row.label}
                </span>
                <span className="font-semibold text-[var(--text-primary)] tabular-nums">{formatCurrency(value)}</span>
              </div>
              <div
                role="progressbar"
                aria-label={row.label}
                aria-valuenow={Math.round(widthPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2 w-full overflow-hidden rounded-full bg-[var(--c-gray-100)]"
              >
                <div
                  className="h-full rounded-full opacity-90 transition-[width,opacity] duration-700 ease-out group-hover:opacity-100"
                  style={{
                    width: `${widthPercent}%`,
                    background: `linear-gradient(90deg, ${row.color}cc, ${row.color})`,
                    transitionDelay: `${index * 90}ms`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
});

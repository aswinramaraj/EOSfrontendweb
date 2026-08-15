import { memo, useMemo } from "react";
import { ChartCard } from "./ChartCard";
import { ChartEmptyState } from "./ChartEmptyState";
import type { PaymentStatusEntry } from "./types";

const STATUS_STYLES: Record<string, { label: string; color: string }> = {
  paid: { label: "Paid", color: "var(--c-success-500,#22c55e)" },
  partial: { label: "Partial", color: "var(--c-warning-500,#f59e0b)" },
  pending: { label: "Pending", color: "var(--c-danger-500,#ef4444)" },
};

const NEUTRAL_COLOR = "var(--c-gray-300,#cbd5e1)";

export const PaymentStatusDistributionChart = memo(function PaymentStatusDistributionChart({
  data,
}: {
  data: PaymentStatusEntry[];
}) {
  const total = useMemo(() => data.reduce((sum, entry) => sum + entry.count, 0), [data]);

  const segments = useMemo(() => {
    if (total === 0) return [];

    let cumulativeDegrees = 0;
    return data.map((entry) => {
      const style = STATUS_STYLES[entry.status] ?? { label: entry.status, color: NEUTRAL_COLOR };
      const startDegrees = cumulativeDegrees;
      const sweepDegrees = (entry.count / total) * 360;
      cumulativeDegrees += sweepDegrees;
      return { ...entry, ...style, startDegrees, endDegrees: cumulativeDegrees };
    });
  }, [data, total]);

  if (data.length === 0 || total === 0) {
    return (
      <ChartCard title="Payment Status Distribution">
        <ChartEmptyState
          label="No payment status data"
          description="Status distribution will appear once payments exist."
        />
      </ChartCard>
    );
  }

  const gradient = segments
    .map((segment) => `${segment.color} ${segment.startDegrees}deg ${segment.endDegrees}deg`)
    .join(", ");
  const summary = segments.map((segment) => `${segment.label}: ${segment.count}`).join(", ");

  return (
    <ChartCard title="Payment Status Distribution">
      <div className="flex flex-wrap items-center gap-6">
        <div
          role="img"
          aria-label={`Payment status distribution — ${summary}`}
          className="flex h-[168px] w-[168px] shrink-0 items-center justify-center rounded-full transition-[background] duration-700"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-white shadow-[var(--shadow-xs)]">
            <span className="finance-fade-in text-[26px] font-semibold leading-none text-[var(--text-primary)] tabular-nums">
              {total}
            </span>
            <span className="mt-1 text-[10.5px] uppercase tracking-[0.05em] text-[var(--text-tertiary)]">Total</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {segments.map((segment) => {
            const percent = total > 0 ? Math.round((segment.count / total) * 100) : 0;
            return (
              <div key={segment.status} className="flex items-center gap-2.5 text-[13px]">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
                <span className="w-14 text-[var(--text-secondary)]">{segment.label}</span>
                <span className="font-semibold text-[var(--text-primary)] tabular-nums">{segment.count}</span>
                <span className="text-[12px] text-[var(--text-tertiary)] tabular-nums">({percent}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
});

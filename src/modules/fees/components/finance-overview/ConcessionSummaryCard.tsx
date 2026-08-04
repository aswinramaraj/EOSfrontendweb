import { TagIcon, DocumentIcon, ShieldCheckIcon, AlertTriangleIcon } from "@/shared/components/icons";
import { formatCurrency } from "../fee-payments/format";
import type { ConcessionSummary } from "./types";

function StatChip({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof DocumentIcon;
}) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--r-md)] bg-[var(--c-gray-25)] px-2.5 py-2">
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[var(--text-tertiary)]"
      >
        <Icon className="h-[12px] w-[12px]" />
      </span>
      <div className="flex flex-col">
        <p className="text-[10.5px] text-[var(--text-tertiary)]">{label}</p>
        <p className="text-[14px] font-semibold text-[var(--text-primary)] tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export function ConcessionSummaryCard({ summary }: { summary: ConcessionSummary }) {
  return (
    <div className="flex h-full flex-col rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white p-4 shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "var(--c-primary-50)", color: "var(--c-primary-600)" }}
        >
          <TagIcon className="h-[15px] w-[15px]" />
        </span>
        <h4 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Concession Summary</h4>
      </div>

      <div className="mt-4">
        <p className="text-[11.5px] text-[var(--text-tertiary)]">Total Concession Amount</p>
        <p className="finance-fade-in mt-0.5 text-[26px] font-semibold leading-[1.1] tracking-[-0.015em] text-[var(--text-primary)] tabular-nums">
          {formatCurrency(summary.totalConcessionAmount)}
        </p>
      </div>

      <div className="my-3.5 h-px bg-[var(--border-subtle)]" />

      <div className="grid grid-cols-3 gap-2">
        <StatChip label="Total" value={summary.count} icon={DocumentIcon} />
        <StatChip label="Settled" value={summary.settledCount} icon={ShieldCheckIcon} />
        <StatChip label="Pending" value={summary.unsettledCount} icon={AlertTriangleIcon} />
      </div>
    </div>
  );
}

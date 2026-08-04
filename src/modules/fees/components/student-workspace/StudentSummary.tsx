import { formatCurrency } from "../fee-payments/format";
import type { StudentFeeSummary } from "./types";

function Metric({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`text-base font-semibold text-zinc-900 ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

interface StudentSummaryProps {
  summary: StudentFeeSummary;
  feeStructureName: string;
  academicYear: string;
  batch: string;
}

export function StudentSummary({ summary, feeStructureName, academicYear, batch }: StudentSummaryProps) {
  return (
    <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
      <Metric label="Total Demand" value={formatCurrency(summary.totalDemand)} />
      <Metric label="Paid Amount" value={formatCurrency(summary.totalPaid)} />
      <Metric label="Outstanding" value={formatCurrency(summary.totalOutstanding)} valueClassName="text-red-600" />

      <div className="flex flex-col gap-1">
        <p className="text-xs text-zinc-500">Collection %</p>
        <p className="text-base font-semibold text-zinc-900">{summary.collectionPercent.toFixed(2)}%</p>
        <span className="h-1.5 w-28 overflow-hidden rounded-full bg-zinc-100">
          <span
            className="block h-full rounded-full bg-green-500"
            style={{ width: `${Math.min(summary.collectionPercent, 100)}%` }}
          />
        </span>
      </div>

      <Metric label="Fee Structure" value={feeStructureName} />
      <Metric label="Academic Year" value={academicYear} />
      <Metric label="Batch" value={batch} />
    </div>
  );
}

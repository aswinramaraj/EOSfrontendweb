import { formatCurrency } from "../fee-payments/format";
import { formatDate } from "../fee-structures/format";
import type { PaymentSummary } from "./types";

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`text-sm font-semibold text-zinc-900 ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

interface PaymentSummaryCardProps {
  summary: PaymentSummary;
  outstandingAmount: number;
}

export function PaymentSummaryCard({ summary, outstandingAmount }: PaymentSummaryCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">Payment Summary</h3>
      <Row label="Paid Amount" value={formatCurrency(summary.totalPaid)} />
      <Row label="Outstanding Amount" value={formatCurrency(outstandingAmount)} valueClassName="text-red-600" />
      <Row label="Last Payment" value={summary.lastPaymentDate ? formatDate(summary.lastPaymentDate) : "—"} />
      <Row label="Payment Count" value={String(summary.paymentCount)} />
    </div>
  );
}

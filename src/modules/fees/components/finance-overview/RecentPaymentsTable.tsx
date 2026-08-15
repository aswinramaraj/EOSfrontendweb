import { memo } from "react";
import { formatCurrency } from "../fee-payments/format";
import { formatDate } from "../fee-structures/format";
import { PaymentModeBadge } from "./PaymentModeBadge";
import type { RecentPayment } from "./types";

interface RecentPaymentsTableProps {
  payments: RecentPayment[];
}

function EmptyRecentPayments() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-14 text-center">
      <p className="text-[13px] font-medium text-[var(--text-primary)]">No payments yet</p>
      <p className="text-[12.5px] text-[var(--text-tertiary)]">Payments will appear here once recorded.</p>
    </div>
  );
}

export const RecentPaymentsTable = memo(function RecentPaymentsTable({ payments }: RecentPaymentsTableProps) {
  return (
    <div className="flex h-full flex-col rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white p-3.5 shadow-[var(--shadow-xs)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
      <h4 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Recent Payments</h4>

      {payments.length === 0 ? (
        <EmptyRecentPayments />
      ) : (
        <div className="mt-3 max-h-[320px] overflow-auto">
          <table className="w-full min-w-[480px] border-collapse text-[12.5px]">
            <caption className="sr-only">Recent payments recorded across all students</caption>
            <thead className="sticky top-0 z-10 bg-white">
              <tr
                className="border-b text-left text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-tertiary)]"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <th scope="col" className="whitespace-nowrap py-2 pr-3 font-medium">Date</th>
                <th scope="col" className="py-2 pr-3 font-medium">Student</th>
                <th scope="col" className="py-2 pr-3 font-medium">Receipt</th>
                <th scope="col" className="py-2 pr-3 font-medium">Mode</th>
                <th scope="col" className="whitespace-nowrap py-2 pr-1 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b text-[var(--text-secondary)] transition-all duration-150 last:border-b-0 hover:-translate-y-px hover:bg-[var(--c-gray-25)] hover:shadow-[var(--shadow-xs)]"
                  style={{ borderColor: "var(--c-gray-100)" }}
                >
                  <td className="whitespace-nowrap py-2.5 pr-3 text-[var(--text-tertiary)]">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="py-2.5 pr-3 font-medium text-[var(--text-primary)]">{payment.studentName ?? "—"}</td>
                  <td className="py-2.5 pr-3 font-mono text-[11.5px] text-[var(--text-secondary)]">
                    {payment.receiptNo}
                  </td>
                  <td className="py-2.5 pr-3">
                    <PaymentModeBadge mode={payment.paymentMode} />
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-1 text-right font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatCurrency(payment.amountPaid)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

import { PencilIcon, TrashIcon, PlusIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import { formatCurrency } from "../fee-payments/format";
import { formatDate } from "../fee-structures/format";
import { PAYMENT_MODE_LABELS } from "./constants";
import type { FeePayment } from "./types";

interface FeePaymentsListProps {
  payments: FeePayment[];
  onAdd: () => void;
  onEdit: (payment: FeePayment) => void;
  onDelete: (payment: FeePayment) => void;
}

export function FeePaymentsList({ payments, onAdd, onEdit, onDelete }: FeePaymentsListProps) {
  const sorted = [...payments].sort((a, b) => (b.paymentDate ?? "").localeCompare(a.paymentDate ?? ""));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">All payments recorded against this student.</p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Receive Payment
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
              <th className="py-3 pl-4 pr-4 font-medium">Date</th>
              <th className="py-3 pr-4 font-medium">Receipt No.</th>
              <th className="py-3 pr-4 font-medium">Mode</th>
              <th className="py-3 pr-4 font-medium">Amount</th>
              <th className="py-3 pr-4 font-medium">Partial</th>
              <th className="py-3 pl-4 pr-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((payment) => (
              <tr key={payment.id} className="border-b border-zinc-100 text-zinc-700 last:border-b-0 hover:bg-zinc-50">
                <td className="py-3 pl-4 pr-4">{formatDate(payment.paymentDate)}</td>
                <td className="py-3 pr-4 text-[#2563EB]">{payment.receiptNo}</td>
                <td className="py-3 pr-4 text-zinc-600">
                  {payment.paymentMode ? PAYMENT_MODE_LABELS[payment.paymentMode] ?? payment.paymentMode : "—"}
                </td>
                <td className="py-3 pr-4 text-zinc-900">{formatCurrency(payment.amountPaid)}</td>
                <td className="py-3 pr-4 text-zinc-600">{payment.isPartial ? "Yes" : "No"}</td>
                <td className="py-3 pl-4 pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(payment)}
                      aria-label="Edit payment"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(payment)}
                      aria-label="Delete payment"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <EmptyState title="No payments recorded" description="Receive a payment to get started." />
        )}
      </div>
    </div>
  );
}

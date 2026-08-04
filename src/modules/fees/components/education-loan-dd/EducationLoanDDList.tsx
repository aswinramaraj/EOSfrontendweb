import { PencilIcon, TrashIcon, PlusIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import { formatCurrency } from "../fee-payments/format";
import { formatDate } from "../fee-structures/format";
import { DD_STATUS_LABELS } from "./constants";
import type { DdStatus, EducationLoanDD } from "./types";

const STATUS_STYLES: Record<DdStatus, string> = {
  received: "bg-zinc-100 text-zinc-600",
  cleared: "bg-green-50 text-green-700",
  bounced: "bg-red-50 text-red-700",
};
const NEUTRAL_STATUS_STYLE = "bg-zinc-100 text-zinc-600";

interface EducationLoanDDListProps {
  items: EducationLoanDD[];
  onAdd: () => void;
  onEdit: (dd: EducationLoanDD) => void;
  onDelete: (dd: EducationLoanDD) => void;
}

export function EducationLoanDDList({ items, onAdd, onEdit, onDelete }: EducationLoanDDListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Education loan demand drafts recorded for this student.</p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add DD
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
              <th className="py-3 pl-4 pr-4 font-medium">DD Reference No.</th>
              <th className="py-3 pr-4 font-medium">Bank</th>
              <th className="py-3 pr-4 font-medium">Amount</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Ack. Receipt No.</th>
              <th className="py-3 pr-4 font-medium">Created</th>
              <th className="py-3 pl-4 pr-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((dd) => (
              <tr key={dd.id} className="border-b border-zinc-100 text-zinc-700 last:border-b-0 hover:bg-zinc-50">
                <td className="py-3 pl-4 pr-4 font-medium text-zinc-900">{dd.ddReferenceNumber}</td>
                <td className="py-3 pr-4 text-zinc-600">{dd.bankName}</td>
                <td className="py-3 pr-4 text-zinc-900">{formatCurrency(dd.amount)}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[dd.status] ?? NEUTRAL_STATUS_STYLE}`}
                  >
                    {DD_STATUS_LABELS[dd.status] ?? dd.status ?? "—"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-zinc-500">{dd.acknowledgementReceiptNo ?? "—"}</td>
                <td className="py-3 pr-4 text-zinc-500">{formatDate(dd.createdAt)}</td>
                <td className="py-3 pl-4 pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(dd)}
                      aria-label="Edit education loan DD"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(dd)}
                      aria-label="Delete education loan DD"
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

        {items.length === 0 && (
          <EmptyState title="No education loan DDs found" description="Add a DD to get started." />
        )}
      </div>
    </div>
  );
}

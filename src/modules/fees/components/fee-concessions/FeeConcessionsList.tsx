import { PencilIcon, TrashIcon, PlusIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import { formatCurrency } from "../fee-payments/format";
import { formatDate } from "../fee-structures/format";
import type { FeeConcession } from "./types";

interface FeeConcessionsListProps {
  items: FeeConcession[];
  onAdd: () => void;
  onEdit: (concession: FeeConcession) => void;
  onDelete: (concession: FeeConcession) => void;
}

export function FeeConcessionsList({ items, onAdd, onEdit, onDelete }: FeeConcessionsListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Concessions applied against this student&apos;s fee structure.</p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Add Concession
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
              <th className="py-3 pl-4 pr-4 font-medium">Concession Amount</th>
              <th className="py-3 pr-4 font-medium">Settled</th>
              <th className="py-3 pr-4 font-medium">Settled Date</th>
              <th className="py-3 pl-4 pr-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((concession) => (
              <tr
                key={concession.id}
                className="border-b border-zinc-100 text-zinc-700 last:border-b-0 hover:bg-zinc-50"
              >
                <td className="py-3 pl-4 pr-4 font-medium text-zinc-900">
                  {formatCurrency(concession.concessionAmount)}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      concession.isSettled ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {concession.isSettled ? "Settled" : "Pending"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-zinc-500">
                  {concession.settledDate ? formatDate(concession.settledDate) : "—"}
                </td>
                <td className="py-3 pl-4 pr-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(concession)}
                      aria-label="Edit fee concession"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(concession)}
                      aria-label="Delete fee concession"
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
          <EmptyState title="No fee concessions found" description="Add a concession to get started." />
        )}
      </div>
    </div>
  );
}

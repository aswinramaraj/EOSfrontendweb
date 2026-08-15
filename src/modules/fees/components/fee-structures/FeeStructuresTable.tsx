import { PencilIcon, TrashIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import type { Quota } from "../quotas/types";
import { APPLIES_TO_LABELS, formatDate } from "./format";
import type { FeeStructure } from "./types";

interface FeeStructuresTableProps {
  feeStructures: FeeStructure[];
  quotas: Quota[];
  onEdit: (feeStructure: FeeStructure) => void;
  onDelete: (feeStructure: FeeStructure) => void;
}

export function FeeStructuresTable({ feeStructures, quotas, onEdit, onDelete }: FeeStructuresTableProps) {
  function quotaName(quotaId: number | null): string {
    if (quotaId === null) return "—";
    return quotas.find((quota) => quota.id === quotaId)?.name ?? "—";
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
            <th className="py-3 pr-4 font-medium">ID</th>
            <th className="py-3 pr-4 font-medium">Name</th>
            <th className="py-3 pr-4 font-medium">Applies To</th>
            <th className="py-3 pr-4 font-medium">Quota</th>
            <th className="py-3 pr-4 font-medium">Academic Year</th>
            <th className="py-3 pr-4 font-medium">Created</th>
            <th className="py-3 pl-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {feeStructures.map((feeStructure) => (
            <tr key={feeStructure.id} className="border-b border-zinc-100 text-zinc-700 hover:bg-zinc-50">
              <td className="py-3 pr-4 text-zinc-500">{feeStructure.id}</td>
              <td className="py-3 pr-4 font-medium text-zinc-900">{feeStructure.name}</td>
              <td className="py-3 pr-4 text-zinc-600">
                {APPLIES_TO_LABELS[feeStructure.appliesTo] ?? feeStructure.appliesTo ?? "—"}
              </td>
              <td className="py-3 pr-4 text-zinc-500">{quotaName(feeStructure.quotaId)}</td>
              <td className="py-3 pr-4 text-zinc-500">{feeStructure.academicYear ?? "—"}</td>
              <td className="py-3 pr-4 text-zinc-500">{formatDate(feeStructure.createdAt)}</td>
              <td className="py-3 pl-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(feeStructure)}
                    aria-label="Edit fee structure"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(feeStructure)}
                    aria-label="Delete fee structure"
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

      {feeStructures.length === 0 && (
        <EmptyState title="No fee structures found" description="Add a fee structure to get started." />
      )}
    </div>
  );
}

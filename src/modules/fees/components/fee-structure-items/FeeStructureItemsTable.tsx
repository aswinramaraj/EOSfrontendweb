import { PencilIcon, TrashIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import { formatCurrency } from "../fee-payments/format";
import type { FeeStructure } from "../fee-structures/types";
import type { DemandCategory } from "../demand-categories/types";
import type { FeeStructureItem } from "./types";

interface FeeStructureItemsTableProps {
  items: FeeStructureItem[];
  feeStructures: FeeStructure[];
  demandCategories: DemandCategory[];
  onEdit: (item: FeeStructureItem) => void;
  onDelete: (item: FeeStructureItem) => void;
}

export function FeeStructureItemsTable({
  items,
  feeStructures,
  demandCategories,
  onEdit,
  onDelete,
}: FeeStructureItemsTableProps) {
  function feeStructureName(id: number): string {
    return feeStructures.find((feeStructure) => feeStructure.id === id)?.name ?? "—";
  }

  function demandCategoryName(id: number): string {
    return demandCategories.find((category) => category.id === id)?.name ?? "—";
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
            <th className="py-3 pr-4 font-medium">ID</th>
            <th className="py-3 pr-4 font-medium">Fee Structure</th>
            <th className="py-3 pr-4 font-medium">Demand Category</th>
            <th className="py-3 pr-4 font-medium">Amount</th>
            <th className="py-3 pl-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100 text-zinc-700 hover:bg-zinc-50">
              <td className="py-3 pr-4 text-zinc-500">{item.id}</td>
              <td className="py-3 pr-4 font-medium text-zinc-900">{feeStructureName(item.feeStructureId)}</td>
              <td className="py-3 pr-4 text-zinc-600">{demandCategoryName(item.demandCategoryId)}</td>
              <td className="py-3 pr-4 text-zinc-900">{formatCurrency(item.amount)}</td>
              <td className="py-3 pl-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label="Edit fee structure item"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label="Delete fee structure item"
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
        <EmptyState title="No fee structure items found" description="Add an item to get started." />
      )}
    </div>
  );
}

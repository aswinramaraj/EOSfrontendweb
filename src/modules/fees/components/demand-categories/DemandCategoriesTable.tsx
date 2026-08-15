import { PencilIcon, TrashIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import type { DemandCategory } from "./types";

interface DemandCategoriesTableProps {
  categories: DemandCategory[];
  onEdit: (category: DemandCategory) => void;
  onDelete: (category: DemandCategory) => void;
}

export function DemandCategoriesTable({ categories, onEdit, onDelete }: DemandCategoriesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
            <th className="py-3 pr-4 font-medium">ID</th>
            <th className="py-3 pr-4 font-medium">Name</th>
            <th className="py-3 pl-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} className="border-b border-zinc-100 text-zinc-700 hover:bg-zinc-50">
              <td className="py-3 pr-4 text-zinc-500">{category.id}</td>
              <td className="py-3 pr-4 font-medium text-zinc-900">{category.name}</td>
              <td className="py-3 pl-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    aria-label="Edit category"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    aria-label="Delete category"
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

      {categories.length === 0 && (
        <EmptyState title="No demand categories found" description="Add a category to get started." />
      )}
    </div>
  );
}

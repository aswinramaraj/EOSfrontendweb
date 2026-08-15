import { PencilIcon, TrashIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import type { Quota } from "./types";

interface QuotasTableProps {
  quotas: Quota[];
  onEdit: (quota: Quota) => void;
  onDelete: (quota: Quota) => void;
}

export function QuotasTable({ quotas, onEdit, onDelete }: QuotasTableProps) {
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
          {quotas.map((quota) => (
            <tr key={quota.id} className="border-b border-zinc-100 text-zinc-700 hover:bg-zinc-50">
              <td className="py-3 pr-4 text-zinc-500">{quota.id}</td>
              <td className="py-3 pr-4 font-medium text-zinc-900">{quota.name}</td>
              <td className="py-3 pl-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onEdit(quota)}
                    aria-label="Edit quota"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(quota)}
                    aria-label="Delete quota"
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

      {quotas.length === 0 && (
        <EmptyState title="No quotas found" description="Add a quota to get started." />
      )}
    </div>
  );
}

import type { ReactNode } from "react";
import { formatCurrency } from "../fee-payments/format";
import { CategoryStatusBadge } from "./CategoryStatusBadge";
import type { CategoryBreakdownItem } from "./category-breakdown.types";

interface DetailRowProps {
  label: string;
  value: ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-900">{value}</span>
    </div>
  );
}

interface CategoryBreakdownSelectProps {
  isMappingSelected: boolean;
  isLoading: boolean;
  error: string | null;
  breakdown: CategoryBreakdownItem[];
  selectedItemId: string;
  onSelectItem: (value: string) => void;
}

export function CategoryBreakdownSelect({
  isMappingSelected,
  isLoading,
  error,
  breakdown,
  selectedItemId,
  onSelectItem,
}: CategoryBreakdownSelectProps) {
  const selectedItem = breakdown.find((item) => String(item.feeStructureItemId) === selectedItemId) ?? null;

  return (
    <div className="flex flex-col gap-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-zinc-700">Fee Category</span>

        {!isMappingSelected ? (
          <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-400">
            Select a demand mapping first.
          </p>
        ) : isLoading ? (
          <p className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-400">
            Loading fee categories...
          </p>
        ) : error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>
        ) : breakdown.length === 0 ? (
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-500">
            No fee categories found for this demand mapping.
          </p>
        ) : (
          <select
            required
            value={selectedItemId}
            onChange={(e) => onSelectItem(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
          >
            <option value="">Select a fee category</option>
            {breakdown.map((item) => (
              <option key={item.feeStructureItemId} value={item.feeStructureItemId}>
                {item.demandCategoryName}
              </option>
            ))}
          </select>
        )}
      </label>

      {selectedItem && (
        <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3.5">
          <DetailRow label="Demand Category" value={selectedItem.demandCategoryName} />
          <DetailRow label="Original Amount" value={formatCurrency(selectedItem.originalAmount)} />
          <DetailRow label="Already Paid" value={formatCurrency(selectedItem.alreadyPaid)} />
          <DetailRow label="Outstanding Amount" value={formatCurrency(selectedItem.outstandingAmount)} />
          <DetailRow label="Status" value={<CategoryStatusBadge status={selectedItem.status} />} />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/icons";
import type { FeeStructure } from "../fee-structures/types";
import type { DemandCategory } from "../demand-categories/types";
import type { FeeStructureItem, FeeStructureItemFormValues } from "./types";

interface FeeStructureItemFormDialogProps {
  item: FeeStructureItem | null;
  feeStructures: FeeStructure[];
  demandCategories: DemandCategory[];
  error?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FeeStructureItemFormValues) => void;
}

export function FeeStructureItemFormDialog({
  item,
  feeStructures,
  demandCategories,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: FeeStructureItemFormDialogProps) {
  const isEdit = item !== null;
  const [feeStructureId, setFeeStructureId] = useState<string>(
    item ? String(item.feeStructureId) : String(feeStructures[0]?.id ?? ""),
  );
  const [demandCategoryId, setDemandCategoryId] = useState<string>(
    item ? String(item.demandCategoryId) : String(demandCategories[0]?.id ?? ""),
  );
  const [amount, setAmount] = useState(item ? String(item.amount) : "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      feeStructureId: Number(feeStructureId),
      demandCategoryId: Number(demandCategoryId),
      amount: Number(amount),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">
            {isEdit ? "Edit Fee Structure Item" : "Add Fee Structure Item"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-400 hover:text-zinc-600"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Fee Structure</span>
              <select
                required
                value={feeStructureId}
                onChange={(e) => setFeeStructureId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
              >
                {feeStructures.map((feeStructure) => (
                  <option key={feeStructure.id} value={feeStructure.id}>
                    {feeStructure.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Demand Category</span>
              <select
                required
                value={demandCategoryId}
                onChange={(e) => setDemandCategoryId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
              >
                {demandCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Amount</span>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 60000"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
            />
          </label>

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

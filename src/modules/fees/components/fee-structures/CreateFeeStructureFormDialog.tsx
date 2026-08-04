"use client";

import { useState, type FormEvent } from "react";
import { CloseIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import type { Quota } from "../quotas/types";
import type { DemandCategory } from "../demand-categories/types";
import { APPLIES_TO_LABELS } from "./format";
import type { FeeStructureAppliesTo, FeeStructureCreateValues } from "./types";

const APPLIES_TO_OPTIONS: FeeStructureAppliesTo[] = ["quota", "hostel", "transport"];

interface ItemRow {
  demandCategoryId: string;
  amount: string;
  concessionAmount: string;
}

function emptyRow(defaultDemandCategoryId: string): ItemRow {
  return { demandCategoryId: defaultDemandCategoryId, amount: "", concessionAmount: "" };
}

interface CreateFeeStructureFormDialogProps {
  quotas: Quota[];
  demandCategories: DemandCategory[];
  error?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FeeStructureCreateValues) => void;
}

export function CreateFeeStructureFormDialog({
  quotas,
  demandCategories,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateFeeStructureFormDialogProps) {
  const defaultDemandCategoryId = String(demandCategories[0]?.id ?? "");

  const [name, setName] = useState("");
  const [appliesTo, setAppliesTo] = useState<FeeStructureAppliesTo>("quota");
  const [quotaId, setQuotaId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([emptyRow(defaultDemandCategoryId)]);

  function updateRow(index: number, changes: Partial<ItemRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(defaultDemandCategoryId)]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      appliesTo,
      quotaId: quotaId ? Number(quotaId) : null,
      academicYear: academicYear.trim(),
      items: rows.map((row) => ({
        demandCategoryId: Number(row.demandCategoryId),
        amount: Number(row.amount),
        concessionAmount: row.concessionAmount ? Number(row.concessionAmount) : null,
      })),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">Add Fee Structure</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-400 hover:text-zinc-600"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex max-h-[75vh] flex-col gap-5 overflow-y-auto">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Name</span>
            <input
              type="text"
              required
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AI&DS - 2026"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Applies To</span>
              <select
                required
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value as FeeStructureAppliesTo)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              >
                {APPLIES_TO_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {APPLIES_TO_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Quota</span>
              <select
                value={quotaId}
                onChange={(e) => setQuotaId(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              >
                <option value="">None</option>
                {quotas.map((quota) => (
                  <option key={quota.id} value={quota.id}>
                    {quota.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Academic Year</span>
            <input
              type="text"
              required
              maxLength={20}
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="e.g. 2026-2027"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-zinc-200 pt-5">
            <span className="text-sm font-semibold text-zinc-900">Fee Structure Items</span>

            <div className="flex flex-col gap-3">
              {rows.map((row, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 sm:flex-row sm:items-end">
                  <label className="block flex-1">
                    <span className="mb-1 block text-xs font-medium text-zinc-700">Demand Category</span>
                    <select
                      required
                      value={row.demandCategoryId}
                      onChange={(e) => updateRow(index, { demandCategoryId: e.target.value })}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                    >
                      {demandCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block flex-1">
                    <span className="mb-1 block text-xs font-medium text-zinc-700">Amount</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => updateRow(index, { amount: e.target.value })}
                      placeholder="e.g. 60000"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                    />
                  </label>

                  <label className="block flex-1">
                    <span className="mb-1 block text-xs font-medium text-zinc-700">Concession Amount</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.concessionAmount}
                      onChange={(e) => updateRow(index, { concessionAmount: e.target.value })}
                      placeholder="Optional"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={rows.length <= 1}
                    aria-label="Delete row"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              className="flex w-fit items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <PlusIcon className="h-4 w-4" />
              Add Item
            </button>
          </div>

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
              {isSubmitting ? "Saving..." : "Add Fee Structure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

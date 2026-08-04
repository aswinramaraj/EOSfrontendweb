"use client";

import { useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/icons";
import type { Quota } from "../quotas/types";
import type { FeeStructure, FeeStructureAppliesTo, FeeStructureFormValues } from "./types";
import { APPLIES_TO_LABELS } from "./format";

const APPLIES_TO_OPTIONS: FeeStructureAppliesTo[] = ["quota", "hostel", "transport"];

interface FeeStructureFormDialogProps {
  feeStructure: FeeStructure | null;
  quotas: Quota[];
  error?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FeeStructureFormValues) => void;
}

export function FeeStructureFormDialog({
  feeStructure,
  quotas,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: FeeStructureFormDialogProps) {
  const isEdit = feeStructure !== null;
  const [name, setName] = useState(feeStructure?.name ?? "");
  const [appliesTo, setAppliesTo] = useState<FeeStructureAppliesTo>(feeStructure?.appliesTo ?? "quota");
  const [quotaId, setQuotaId] = useState<string>(feeStructure?.quotaId ? String(feeStructure.quotaId) : "");
  const [academicYear, setAcademicYear] = useState(feeStructure?.academicYear ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      appliesTo,
      quotaId: quotaId ? Number(quotaId) : null,
      academicYear: academicYear.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">
            {isEdit ? "Edit Fee Structure" : "Add Fee Structure"}
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
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Fee Structure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

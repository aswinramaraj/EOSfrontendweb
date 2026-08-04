"use client";

import { useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/icons";
import type { FeeConcession, FeeConcessionFormValues } from "./types";

interface FeeConcessionFormDialogProps {
  concession: FeeConcession | null;
  error?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FeeConcessionFormValues) => void;
}

export function FeeConcessionFormDialog({
  concession,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: FeeConcessionFormDialogProps) {
  const isEdit = concession !== null;

  const [concessionAmount, setConcessionAmount] = useState(concession ? String(concession.concessionAmount) : "");
  const [isSettled, setIsSettled] = useState(concession?.isSettled ?? false);
  const [settledDate, setSettledDate] = useState(concession?.settledDate ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      concessionAmount: Number(concessionAmount),
      isSettled,
      settledDate: settledDate ? settledDate : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">
            {isEdit ? "Edit Fee Concession" : "Add Fee Concession"}
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
            <span className="mb-1 block text-sm font-medium text-zinc-700">Concession Amount</span>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              value={concessionAmount}
              onChange={(e) => setConcessionAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSettled}
              onChange={(e) => setIsSettled(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-[#2563EB] focus:ring-[#BFDBFE]"
            />
            <span className="text-sm font-medium text-zinc-700">Settled</span>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">Settled Date</span>
            <input
              type="date"
              value={settledDate}
              onChange={(e) => setSettledDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
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
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Concession"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

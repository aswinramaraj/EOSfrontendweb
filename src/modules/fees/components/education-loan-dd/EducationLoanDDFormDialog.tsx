"use client";

import { useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/icons";
import { DD_STATUS_LABELS } from "./constants";
import type { DdStatus, EducationLoanDD, EducationLoanDDFormValues } from "./types";

const STATUS_OPTIONS: DdStatus[] = ["received", "cleared", "bounced"];

interface EducationLoanDDFormDialogProps {
  dd: EducationLoanDD | null;
  error?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: EducationLoanDDFormValues) => void;
}

export function EducationLoanDDFormDialog({
  dd,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: EducationLoanDDFormDialogProps) {
  const isEdit = dd !== null;

  const [ddReferenceNumber, setDdReferenceNumber] = useState(dd?.ddReferenceNumber ?? "");
  const [bankName, setBankName] = useState(dd?.bankName ?? "");
  const [amount, setAmount] = useState(dd ? String(dd.amount) : "");
  const [status, setStatus] = useState<DdStatus>(dd?.status ?? "received");
  const [acknowledgementReceiptNo, setAcknowledgementReceiptNo] = useState(dd?.acknowledgementReceiptNo ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      ddReferenceNumber: ddReferenceNumber.trim(),
      bankName: bankName.trim(),
      amount: Number(amount),
      status,
      acknowledgementReceiptNo: acknowledgementReceiptNo.trim() ? acknowledgementReceiptNo.trim() : null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-7 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900">
            {isEdit ? "Edit Education Loan DD" : "Add Education Loan DD"}
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

        <form onSubmit={handleSubmit} className="mt-5 flex max-h-[75vh] flex-col gap-5 overflow-y-auto">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700">DD Reference Number</span>
            <input
              type="text"
              required
              maxLength={50}
              value={ddReferenceNumber}
              onChange={(e) => setDdReferenceNumber(e.target.value)}
              placeholder="e.g. DD2025000441"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
            />
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Bank Name</span>
              <input
                type="text"
                required
                maxLength={150}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Canara Bank"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Amount</span>
              <input
                type="number"
                required
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Status</span>
              <select
                required
                value={status}
                onChange={(e) => setStatus(e.target.value as DdStatus)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {DD_STATUS_LABELS[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700">Ack. Receipt No.</span>
              <input
                type="text"
                maxLength={50}
                value={acknowledgementReceiptNo}
                onChange={(e) => setAcknowledgementReceiptNo(e.target.value)}
                placeholder="e.g. ACK25080012"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </label>
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
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add DD"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

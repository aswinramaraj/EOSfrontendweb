"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CloseIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { formatCurrency } from "../fee-payments/format";
import { PAYMENT_MODE_LABELS } from "./constants";
import { CategoryBreakdownSelect } from "./CategoryBreakdownSelect";
import { categoryBreakdownService } from "../../services/category-breakdown.service";
import { feePaymentsService } from "../../services/fee-payments.service";
import type { CategoryBreakdownItem } from "./category-breakdown.types";
import type { FeePayment, FeePaymentFormValues, PaymentMode } from "./types";
import type { DemandSummaryItem } from "../student-workspace/types";

const PAYMENT_MODE_OPTIONS: PaymentMode[] = ["cash", "card", "upi", "dd", "netbanking"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface FeePaymentDrawerProps {
  payment: FeePayment | null;
  demandMappings: DemandSummaryItem[];
  error?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FeePaymentFormValues, demandMappingId: number | null) => void;
}

export function FeePaymentDrawer({
  payment,
  demandMappings,
  error,
  isSubmitting,
  onClose,
  onSubmit,
}: FeePaymentDrawerProps) {
  const isEdit = payment !== null;

  const [demandMappingId, setDemandMappingId] = useState("");
  const [mappingError, setMappingError] = useState<string | null>(null);

  // Category-wise breakdown (Create flow only) — loaded once per demand
  // mapping selection; switching categories re-reads this same array, no
  // extra backend request.
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState("");

  // Category-required submission state (Create flow only) — kept separate
  // from the parent-controlled `isSubmitting`/`error` props, which continue
  // to serve Edit exactly as before.
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function fetchCategoryBreakdown(mappingId: number) {
    setIsLoadingCategories(true);
    setCategoryError(null);

    return categoryBreakdownService
      .get(mappingId)
      .then((items) => setCategoryBreakdown(items))
      .catch((err: unknown) => {
        setCategoryBreakdown([]);
        setCategoryError(err instanceof ApiError ? err.message : "Failed to load fee categories.");
      })
      .finally(() => setIsLoadingCategories(false));
  }

  useEffect(() => {
    if (isEdit || !demandMappingId) {
      setCategoryBreakdown([]);
      setSelectedItemId("");
      return;
    }

    setSelectedItemId("");
    fetchCategoryBreakdown(Number(demandMappingId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandMappingId, isEdit]);

  const [amountPaid, setAmountPaid] = useState(payment ? String(payment.amountPaid) : "");
  const [paymentDate, setPaymentDate] = useState(payment?.paymentDate ?? todayIso());
  const [paymentMode, setPaymentMode] = useState<PaymentMode | "">(payment?.paymentMode ?? "");
  const [receiptNo, setReceiptNo] = useState(payment?.receiptNo ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (isEdit) {
      onSubmit(
        {
          amountPaid: Number(amountPaid),
          paymentDate,
          paymentMode: paymentMode === "" ? null : paymentMode,
          receiptNo: receiptNo.trim(),
        },
        null,
      );
      return;
    }

    if (!demandMappingId) {
      setMappingError("Select a demand mapping to continue.");
      return;
    }
    setMappingError(null);

    if (!selectedItemId) {
      setCreateError("Select a fee category to continue.");
      return;
    }

    if (isSubmittingCreate) return;

    setIsSubmittingCreate(true);
    setCreateError(null);

    feePaymentsService
      .createForCategory(Number(demandMappingId), Number(selectedItemId), {
        amountPaid: Number(amountPaid),
        paymentDate,
        paymentMode: paymentMode === "" ? null : paymentMode,
      })
      .then(() => {
        // Refresh ONLY the category breakdown — the dialog stays open, the
        // selected category stays selected, and only "Student Paying" resets.
        setAmountPaid("");
        return fetchCategoryBreakdown(Number(demandMappingId));
      })
      .catch((err: unknown) => {
        setCreateError(err instanceof ApiError ? err.message : "Failed to record payment.");
      })
      .finally(() => setIsSubmittingCreate(false));
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-zinc-900/40" onClick={onClose} />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <h3 className="text-lg font-semibold text-zinc-900">
            {isEdit ? "Edit Payment" : "Receive Payment"}
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

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col gap-5 px-6 py-5">
            {(isEdit ? error : createError) && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{isEdit ? error : createError}</p>
            )}

            {!isEdit && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Demand Mapping</span>
                <select
                  required
                  value={demandMappingId}
                  onChange={(e) => {
                    setDemandMappingId(e.target.value);
                    setMappingError(null);
                  }}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
                >
                  <option value="">Select a demand mapping</option>
                  {demandMappings.map((mapping) => (
                    <option key={mapping.studentFeeDemandMappingId} value={mapping.studentFeeDemandMappingId}>
                      {mapping.feeStructureName} — Academic Year: {mapping.academicYear} — Semester:{" "}
                      {mapping.semester} — Amount: {formatCurrency(mapping.totalAmount)}
                    </option>
                  ))}
                </select>
                {mappingError && <p className="mt-1 text-sm text-red-600">{mappingError}</p>}
              </label>
            )}

            {!isEdit && (
              <>
                <CategoryBreakdownSelect
                  isMappingSelected={!!demandMappingId}
                  isLoading={isLoadingCategories}
                  error={categoryError}
                  breakdown={categoryBreakdown}
                  selectedItemId={selectedItemId}
                  onSelectItem={setSelectedItemId}
                />

                {selectedItemId && (
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-zinc-700">Student Paying</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
                    />
                  </label>
                )}
              </>
            )}

            {isEdit && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Amount Paid</span>
                <input
                  type="number"
                  required
                  min={0}
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="e.g. 20000"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
                />
              </label>
            )}

            <div className="grid grid-cols-2 gap-5">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Payment Date</span>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Payment Mode</span>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode | "")}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
                >
                  <option value="">None</option>
                  {PAYMENT_MODE_OPTIONS.map((mode) => (
                    <option key={mode} value={mode}>
                      {PAYMENT_MODE_LABELS[mode]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {isEdit && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-zinc-700">Receipt No.</span>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="e.g. RCP25080014"
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2F6FE0] focus:ring-2 focus:ring-[#BFD3F5]"
                />
              </label>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-6 py-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEdit ? isSubmitting : isSubmittingCreate || !selectedItemId || !amountPaid}
              className="rounded-lg bg-[#2F6FE0] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEdit
                ? isSubmitting
                  ? "Saving..."
                  : "Save Changes"
                : isSubmittingCreate
                  ? "Saving..."
                  : "Receive Payment"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PencilIcon, TrashIcon, PlusIcon } from "@/shared/components/icons";
import { EmptyState } from "../fee-payments/EmptyState";
import { formatCurrency } from "../fee-payments/format";
import { formatDate } from "../fee-structures/format";
import { PAYMENT_MODE_LABELS } from "./constants";
import { ReceiptDocument, type ReceiptStudentInfo } from "./ReceiptDocument";
import type { FeePayment } from "./types";

interface FeePaymentsListProps {
  payments: FeePayment[];
  student: ReceiptStudentInfo;
  onAdd: () => void;
  onEdit: (payment: FeePayment) => void;
  onDelete: (payment: FeePayment) => void;
}

export function FeePaymentsList({ payments, student, onAdd, onEdit, onDelete }: FeePaymentsListProps) {
  const sorted = [...payments].sort((a, b) => (b.paymentDate ?? "").localeCompare(a.paymentDate ?? ""));

  // Selection is local to this table — it lives only as long as this
  // component is mounted, so it clears on its own whenever the Payment
  // History tab (or the whole workspace) unmounts. There is no print
  // drawer/dialog yet in this step for it to explicitly clear against;
  // that wiring belongs to the step that actually builds Print Receipt.
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectableIds = sorted.map((payment) => payment.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  function toggleOne(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]));
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : selectableIds);
  }

  // Print preview: mounted only while printing, so it never affects normal
  // ERP screen layout. Selected rows are used exactly as-is (same values
  // already shown in the table), in the same date order, never merged.
  const [isPrinting, setIsPrinting] = useState(false);
  const selectedPayments = sorted.filter((payment) => selectedIds.includes(payment.id));

  // "From Education Loan" is a print-time-only annotation, not a data change —
  // it never touches any payment record. The DD reference number is entered
  // fresh by billing staff for this print action and only reaches the
  // receipt when this toggle is on; a normal receipt never carries it.
  const [isEducationLoanReceipt, setIsEducationLoanReceipt] = useState(false);
  const [ddReferenceNumber, setDdReferenceNumber] = useState("");
  const canPrint = selectedIds.length > 0 && (!isEducationLoanReceipt || ddReferenceNumber.trim() !== "");

  useEffect(() => {
    if (!isPrinting) return;

    function handleAfterPrint() {
      setIsPrinting(false);
      setIsEducationLoanReceipt(false);
      setDdReferenceNumber("");
    }

    window.addEventListener("afterprint", handleAfterPrint);
    const timer = window.setTimeout(() => window.print(), 50);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
      window.clearTimeout(timer);
    };
  }, [isPrinting]);

  return (
    <div className="flex flex-col gap-4">
      {/* print:hidden ensures every ERP control is removed from layout (not
          just visually hidden) while printing — the previous visibility:
          hidden approach left this whole block's height in the page flow,
          which is what produced the extra blank printed pages. */}
      <div className="print:hidden flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">All payments recorded against this student.</p>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4" />
          Receive Payment
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs font-medium text-zinc-500">
              <th className="w-10 py-3 pl-4 pr-2 font-medium">
                <input
                  type="checkbox"
                  aria-label="Select all payments"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  disabled={selectableIds.length === 0}
                  className="h-4 w-4 rounded border-zinc-300 text-[#2563EB] focus:ring-[#BFDBFE]"
                />
              </th>
              <th className="py-3 pr-4 font-medium">Date</th>
              <th className="py-3 pr-4 font-medium">Demand Category</th>
              <th className="py-3 pr-4 font-medium">Receipt No.</th>
              <th className="py-3 pr-4 font-medium">Mode</th>
              <th className="py-3 pr-4 font-medium">Amount</th>
              <th className="py-3 pr-4 font-medium">Partial</th>
              <th className="py-3 pl-4 pr-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((payment) => {
              const isSelected = selectedIds.includes(payment.id);
              return (
                <tr
                  key={payment.id}
                  className={`border-b border-zinc-100 text-zinc-700 last:border-b-0 hover:bg-zinc-50 ${
                    isSelected ? "bg-blue-50/60" : ""
                  }`}
                >
                  <td className="py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      aria-label={`Select payment ${payment.receiptNo}`}
                      checked={isSelected}
                      onChange={() => toggleOne(payment.id)}
                      className="h-4 w-4 rounded border-zinc-300 text-[#2563EB] focus:ring-[#BFDBFE]"
                    />
                  </td>
                  <td className="py-3 pr-4">{formatDate(payment.paymentDate)}</td>
                  <td className="py-3 pr-4 text-zinc-600">{payment.demandCategoryName ?? "—"}</td>
                  <td className="py-3 pr-4 text-[#2563EB]">{payment.receiptNo}</td>
                  <td className="py-3 pr-4 text-zinc-600">
                    {payment.paymentMode ? PAYMENT_MODE_LABELS[payment.paymentMode] ?? payment.paymentMode : "—"}
                  </td>
                  <td className="py-3 pr-4 text-zinc-900">{formatCurrency(payment.amountPaid)}</td>
                  <td className="py-3 pr-4 text-zinc-600">{payment.isPartial ? "Yes" : "No"}</td>
                  <td className="py-3 pl-4 pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(payment)}
                        aria-label="Edit payment"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(payment)}
                        aria-label="Delete payment"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <EmptyState title="No payments recorded" description="Receive a payment to get started." />
        )}
      </div>

      {sorted.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-600">
              Selected Payments : <span className="font-medium text-zinc-900">{selectedIds.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={() => setIsEducationLoanReceipt((prev) => !prev)}
                aria-pressed={isEducationLoanReceipt}
                className={`rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                  isEducationLoanReceipt
                    ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                    : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                From Education Loan
              </button>
              <button
                type="button"
                disabled={!canPrint}
                onClick={() => setIsPrinting(true)}
                className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
              >
                Print Receipt
              </button>
            </div>
          </div>

          {isEducationLoanReceipt && (
            <label className="block max-w-xs">
              <span className="mb-1 block text-sm font-medium text-zinc-700">DD Reference Number</span>
              <input
                type="text"
                required
                value={ddReferenceNumber}
                onChange={(e) => setDdReferenceNumber(e.target.value)}
                placeholder="e.g. DD2025000441"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#BFDBFE]"
              />
            </label>
          )}
        </div>
      )}
      </div>

      {/* Portaled to a direct child of <body> (id="receipt-print-root") so the
          global print rule in globals.css can hide every other top-level
          element — sidebar, topbar, page background — regardless of how
          deeply this component is nested inside them. `hidden print:block`
          keeps it invisible on screen and out of normal layout until the
          print stylesheet activates it. */}
      {isPrinting &&
        createPortal(
          <div id="receipt-print-root" className="hidden print:block">
            <ReceiptDocument
              student={student}
              payments={selectedPayments}
              ddReferenceNumber={isEducationLoanReceipt ? ddReferenceNumber.trim() : undefined}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

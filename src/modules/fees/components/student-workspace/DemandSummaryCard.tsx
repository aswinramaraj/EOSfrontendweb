import { formatCurrency } from "../fee-payments/format";
import type { DemandSummaryItem, StudentFeeSummary } from "./types";

interface DemandSummaryCardProps {
  items: DemandSummaryItem[];
  // Paid/Outstanding are only available at the overall-student level from
  // the backend (fee_summary) — there is no per-demand-mapping paid/
  // outstanding split in the API response, so the per-row table below
  // stays Amount-only (real data) and the real paid/outstanding totals are
  // shown as a summary strip instead of being fabricated per row.
  feeSummary: StudentFeeSummary;
}

export function DemandSummaryCard({ items, feeSummary }: DemandSummaryCardProps) {
  const total = items.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">Demand Summary</h3>

      <div className="mt-3 grid grid-cols-3 gap-3 rounded-lg bg-zinc-50 p-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-zinc-500">Total Demand</p>
          <p className="text-sm font-semibold text-zinc-900">{formatCurrency(feeSummary.totalDemand)}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-zinc-500">Paid Amount</p>
          <p className="text-sm font-semibold text-green-700">{formatCurrency(feeSummary.totalPaid)}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-zinc-500">Remaining Amount</p>
          <p className="text-sm font-semibold text-red-600">{formatCurrency(feeSummary.totalOutstanding)}</p>
        </div>
      </div>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-zinc-500">
            <th className="pb-2 font-medium">Fee Structure</th>
            <th className="pb-2 font-medium">Academic Year</th>
            <th className="pb-2 font-medium">Semester</th>
            <th className="pb-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.studentFeeDemandMappingId} className="border-t border-zinc-100">
              <td className="py-2 text-zinc-600">{item.feeStructureName}</td>
              <td className="py-2 text-zinc-600">{item.academicYear}</td>
              <td className="py-2 text-zinc-600">{item.semester}</td>
              <td className="py-2 text-right text-zinc-900">{formatCurrency(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-zinc-200 font-semibold text-zinc-900">
            <td className="py-2" colSpan={3}>
              Total
            </td>
            <td className="py-2 text-right">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

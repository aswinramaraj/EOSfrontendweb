import { formatCurrency } from "../fee-payments/format";
import type { DemandSummaryItem } from "./types";

export function DemandSummaryCard({ items }: { items: DemandSummaryItem[] }) {
  const total = items.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900">Demand Summary</h3>

      <table className="mt-3 w-full text-sm">
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

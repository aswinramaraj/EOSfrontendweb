import { StudentAvatar } from "./StudentAvatar";
import { FeeStatusBadge } from "./FeeStatusBadge";
import { FeePaymentsActions } from "./FeePaymentsActions";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { formatCurrency } from "./format";
import type { FeePaymentRow } from "./types";

const COLUMNS = [
  "Student",
  "Register No.",
  "Programme / Department",
  "Batch",
  "Total Demand",
  "Paid Amount",
  "Outstanding",
  "Due Status",
  "Last Payment",
  "Actions",
];

interface FeePaymentsTableProps {
  rows: FeePaymentRow[];
  isLoading?: boolean;
  onViewStudent?: (row: FeePaymentRow) => void;
}

export function FeePaymentsTable({ rows, isLoading, onViewStudent }: FeePaymentsTableProps) {
  return (
    <div
      className="overflow-x-auto rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white shadow-[var(--shadow-xs)]"
    >
      <table className="w-full min-w-[960px] border-collapse text-[13px]">
        <thead>
          <tr
            className="border-b text-left text-[12px] font-medium text-[var(--text-tertiary)]"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <th className="w-8 py-3 pl-[var(--sp-4)] pr-2">
              <input type="checkbox" disabled className="h-3.5 w-3.5 rounded border-[var(--border-default)]" />
            </th>
            {COLUMNS.map((column) => (
              <th
                key={column}
                className={`py-3 pr-[var(--sp-4)] font-medium ${column === "Actions" ? "text-right" : ""}`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            rows.map((row) => (
              <tr
                key={row.id}
                className="group border-b text-[var(--text-secondary)] transition-colors last:border-b-0 hover:bg-[var(--c-gray-25)]"
                style={{ borderColor: "var(--c-gray-100)" }}
              >
                <td className="py-3 pl-[var(--sp-4)] pr-2">
                  <input type="checkbox" disabled className="h-3.5 w-3.5 rounded border-[var(--border-default)]" />
                </td>
                <td className="py-3 pr-[var(--sp-4)]">
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={row.studentName} />
                    <span className="font-medium text-[var(--text-primary)]">{row.studentName}</span>
                  </div>
                </td>
                <td className="py-3 pr-[var(--sp-4)] text-[var(--text-tertiary)]">{row.registerNo}</td>
                <td className="py-3 pr-[var(--sp-4)]">
                  <p className="text-[var(--text-primary)]">{row.programme}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{row.department}</p>
                </td>
                <td className="py-3 pr-[var(--sp-4)] text-[var(--text-tertiary)]">{row.batch}</td>
                <td className="py-3 pr-[var(--sp-4)] text-[var(--text-primary)]">{formatCurrency(row.totalDemand)}</td>
                <td className="py-3 pr-[var(--sp-4)] text-[var(--text-primary)]">{formatCurrency(row.paidAmount)}</td>
                <td className="py-3 pr-[var(--sp-4)] text-[var(--text-primary)]">{formatCurrency(row.outstanding)}</td>
                <td className="py-3 pr-[var(--sp-4)]">
                  <FeeStatusBadge status={row.dueStatus} />
                </td>
                <td className="py-3 pr-[var(--sp-4)] text-[var(--text-tertiary)]">{row.lastPayment ?? "—"}</td>
                <td className="py-3 pl-[var(--sp-4)] pr-[var(--sp-4)]">
                  <FeePaymentsActions onView={() => onViewStudent?.(row)} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {isLoading && <LoadingState />}
      {!isLoading && rows.length === 0 && <EmptyState />}
    </div>
  );
}

import { memo } from "react";
import { formatCurrency } from "../fee-payments/format";
import type { TopOutstandingStudent } from "./types";

function EmptyOutstandingStudents() {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-14 text-center">
      <p className="text-[13px] font-medium text-[var(--text-primary)]">No outstanding students</p>
      <p className="text-[12.5px] text-[var(--text-tertiary)]">All students have cleared their dues.</p>
    </div>
  );
}

export const TopOutstandingStudentsTable = memo(function TopOutstandingStudentsTable({
  students,
}: {
  students: TopOutstandingStudent[];
}) {
  return (
    <div className="flex h-full flex-col rounded-[var(--r-xl)] border border-[var(--border-subtle)] bg-white p-3.5 shadow-[var(--shadow-xs)] transition-shadow duration-200 hover:shadow-[var(--shadow-md)]">
      <h4 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Top Outstanding Students</h4>

      {students.length === 0 ? (
        <EmptyOutstandingStudents />
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[340px] border-collapse text-[12.5px]">
            <caption className="sr-only">Students ranked by highest outstanding fee amount</caption>
            <thead>
              <tr
                className="border-b text-left text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-tertiary)]"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <th scope="col" className="w-8 py-2 pr-2 font-medium">Rank</th>
                <th scope="col" className="py-2 pr-3 font-medium">Student</th>
                <th scope="col" className="py-2 pr-3 font-medium">Register No.</th>
                <th scope="col" className="py-2 pr-1 text-right font-medium">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => {
                const isTopThree = index < 3;
                return (
                  <tr
                    key={student.studentId}
                    className="border-b text-[var(--text-secondary)] transition-all duration-150 last:border-b-0 hover:-translate-y-px hover:bg-[var(--c-gray-25)] hover:shadow-[var(--shadow-xs)]"
                    style={{ borderColor: "var(--c-gray-100)" }}
                  >
                    <td className="py-2.5 pr-2">
                      <span
                        className={
                          isTopThree
                            ? "flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--c-danger-600)] text-[11px] font-semibold text-white tabular-nums"
                            : "flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--c-gray-100)] text-[11px] font-medium text-[var(--text-tertiary)] tabular-nums"
                        }
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 font-medium text-[var(--text-primary)]">{student.studentName ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-[var(--text-tertiary)]">{student.registerNumber ?? "—"}</td>
                    <td className="py-2.5 pr-1 text-right">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-semibold tabular-nums"
                        style={{ background: "var(--c-danger-50)", color: "var(--c-danger-600)" }}
                      >
                        {formatCurrency(student.totalOutstanding)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

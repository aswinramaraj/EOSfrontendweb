"use client";

import { useAssignmentSubmissions } from "../hooks/academics.hooks";
import type { Assignment } from "../types/academics.types";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";
import { StudentRosterUnavailableNotice } from "../../dashboard/components/StudentRosterUnavailableNotice";
import { Modal } from "./Modal";

function studentDisplayName(firstName: string | null, lastName: string | null, fallback: string): string {
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || fallback;
}

interface ViewSubmissionsModalProps {
  assignment: Assignment;
  onClose: () => void;
}

export function ViewSubmissionsModal({ assignment, onClose }: ViewSubmissionsModalProps) {
  const { status, rows, rosterAvailable, error, actionError, pendingStudentId, toggleSubmitted, retry } =
    useAssignmentSubmissions(assignment);

  const submittedCount = rows.filter((row) => row.isSubmitted).length;

  return (
    <Modal title={`Submissions — Assignment #${assignment.sequence_no}`} onClose={onClose} widthClassName="max-w-lg">
      <p className="-mt-1 mb-4 text-xs text-slate-500">
        {assignment.title ?? "(Untitled assignment)"} · {assignment.subject.name} ({assignment.subject.subject_code})
      </p>

      <DashboardSectionState status={status} error={error} onRetry={retry} skeletonRows={5}>
        {!rosterAvailable ? (
          <StudentRosterUnavailableNotice />
        ) : rows.length === 0 ? (
          <p className="text-center text-sm text-slate-400">No students are enrolled in this class.</p>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-800">
                {submittedCount} / {rows.length} submitted
              </span>
              {actionError && <span className="text-xs font-medium text-red-600">{actionError}</span>}
            </div>

            <ul className="flex flex-col gap-1">
              {rows.map((row) => (
                <li key={row.student.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {studentDisplayName(row.student.firstName, row.student.lastName, row.student.studentIdNo)}
                    </p>
                    <p className="truncate text-xs text-slate-400">{row.student.registerNo ?? row.student.studentIdNo}</p>
                  </div>

                  <button
                    type="button"
                    disabled={pendingStudentId === row.student.id}
                    onClick={() => toggleSubmitted(row)}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      row.isSubmitted
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {pendingStudentId === row.student.id ? "Saving…" : row.isSubmitted ? "Submitted" : "Not Submitted"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </DashboardSectionState>
    </Modal>
  );
}

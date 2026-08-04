"use client";

import { useState } from "react";
import { useAssignments, useAssignmentSubmissionCounts } from "../hooks/academics.hooks";
import type { AcademicsMappingOption, Assignment } from "../types/academics.types";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";
import { CreateAssignmentModal } from "./CreateAssignmentModal";
import { PlusIcon, TrashIcon } from "./icons";
import { ViewSubmissionsModal } from "./ViewSubmissionsModal";

interface AssignmentsTabProps {
  selectedOption: AcademicsMappingOption | null;
}

export function AssignmentsTab({ selectedOption }: AssignmentsTabProps) {
  const { status, assignments, error, actionError, retry, createAssignment, deleteAssignment } = useAssignments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submissionsFor, setSubmissionsFor] = useState<Assignment | null>(null);

  const filtered = selectedOption
    ? assignments.filter(
        (a) =>
          a.class.id === selectedOption.classId &&
          a.subject.id === selectedOption.subjectId &&
          a.academic_year === selectedOption.academicYear,
      )
    : assignments;

  const { counts } = useAssignmentSubmissionCounts(filtered);

  if (!selectedOption) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
        Select a class &amp; subject above to view assignments.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Assignments — {selectedOption.departmentCode} {selectedOption.classSection}
        </h2>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          Create Assignment
        </button>
      </div>

      {actionError && <p className="text-sm font-medium text-red-600">{actionError}</p>}

      <DashboardSectionState
        status={status}
        error={error}
        onRetry={retry}
        emptyMessage="No assignments yet for any of your classes."
        skeletonRows={3}
      >
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No assignments yet for this class &amp; subject.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered.map((assignment) => {
              const count = counts.get(assignment.id);
              return (
                <li key={assignment.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                          Assignment #{assignment.sequence_no}
                        </span>
                        <span className="text-xs text-slate-400">{assignment.subject.name}</span>
                      </div>
                      <p className="text-base font-bold text-slate-900">{assignment.title ?? "(Untitled assignment)"}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Semester {assignment.semester} · AY {assignment.academic_year}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">
                          {count ? `${count.submitted} / ${count.total}` : "—"}
                        </p>
                        <p className="text-xs text-slate-400">Submissions</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmissionsFor(assignment)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View Submissions
                      </button>
                      <button
                        type="button"
                        aria-label="Delete assignment"
                        onClick={() => deleteAssignment(assignment.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardSectionState>

      {isCreateOpen && (
        <CreateAssignmentModal
          selectedOption={selectedOption}
          existingAssignments={assignments}
          onSubmit={createAssignment}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {submissionsFor && <ViewSubmissionsModal assignment={submissionsFor} onClose={() => setSubmissionsFor(null)} />}
    </div>
  );
}

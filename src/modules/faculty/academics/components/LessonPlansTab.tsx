"use client";

import { useState } from "react";
import { useLessonPlans } from "../hooks/academics.hooks";
import type { AcademicsMappingOption, LessonPlan } from "../types/academics.types";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";
import { PlusIcon, TrashIcon } from "./icons";
import { Modal } from "./Modal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

interface EditPlanModalProps {
  selectedOption: AcademicsMappingOption;
  plan: LessonPlan | null;
  onSubmit: (semester: number, content: string) => Promise<boolean>;
  onClose: () => void;
}

function EditPlanModal({ selectedOption, plan, onSubmit, onClose }: EditPlanModalProps) {
  const [semester, setSemester] = useState(plan ? String(plan.semester) : "1");
  const [content, setContent] = useState(plan?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const semesterNum = Number(semester);
    if (!Number.isInteger(semesterNum) || semesterNum < 1) {
      setError("Semester must be a positive whole number.");
      return;
    }
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const ok = await onSubmit(semesterNum, content.trim());
    setIsSubmitting(false);
    if (ok) onClose();
    else setError("Could not save the lesson plan. Please try again.");
  }

  return (
    <Modal title={plan ? "Edit Lesson Plan" : "New Lesson Plan"} onClose={onClose} widthClassName="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="-mt-1 text-xs text-slate-500">
          {selectedOption.subjectName} ({selectedOption.subjectCode}) — {selectedOption.departmentCode}{" "}
          {selectedOption.classSection}
        </p>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Semester</span>
          <input
            type="number"
            min={1}
            value={semester}
            disabled={plan !== null}
            onChange={(e) => setSemester(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder="Unit-by-unit plan for the semester…"
            className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isSubmitting ? "Saving…" : "Save Lesson Plan"}
        </button>
      </form>
    </Modal>
  );
}

interface LessonPlansTabProps {
  facultyId: number | null;
  selectedOption: AcademicsMappingOption | null;
}

export function LessonPlansTab({ facultyId, selectedOption }: LessonPlansTabProps) {
  const { status, plans, error, actionError, retry, upsertPlan, deletePlan } = useLessonPlans(facultyId);
  const [editing, setEditing] = useState<LessonPlan | "new" | null>(null);

  const filtered = selectedOption
    ? plans.filter((plan) => plan.class.id === selectedOption.classId && plan.subject.id === selectedOption.subjectId)
    : plans;

  if (!selectedOption) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
        Select a class &amp; subject above to view lesson plans.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Lesson Plans — {selectedOption.departmentCode} {selectedOption.classSection}
        </h2>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" />
          New Lesson Plan
        </button>
      </div>

      {actionError && <p className="text-sm font-medium text-red-600">{actionError}</p>}

      <DashboardSectionState status={status} error={error} onRetry={retry} emptyMessage="No lesson plans yet." skeletonRows={3}>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No lesson plans yet for this class &amp; subject.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filtered
              .slice()
              .sort((a, b) => a.semester - b.semester)
              .map((plan) => (
                <li key={plan.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                        Semester {plan.semester}
                      </span>
                      <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-slate-700">{plan.content}</p>
                      <p className="mt-2 text-xs text-slate-400">Updated {formatDate(plan.updated_at)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(plan)}
                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        aria-label="Delete lesson plan"
                        onClick={() => deletePlan(plan.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </DashboardSectionState>

      {editing && (
        <EditPlanModal
          selectedOption={selectedOption}
          plan={editing === "new" ? null : editing}
          onSubmit={(semester, content) =>
            upsertPlan({ subjectId: selectedOption.subjectId, classId: selectedOption.classId, semester, content })
          }
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

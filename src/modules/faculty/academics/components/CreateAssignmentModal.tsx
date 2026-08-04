"use client";

import { useMemo, useState } from "react";
import type { AcademicsMappingOption, Assignment, CreateAssignmentPayload } from "../types/academics.types";
import { Modal } from "./Modal";

interface CreateAssignmentModalProps {
  selectedOption: AcademicsMappingOption;
  existingAssignments: Assignment[];
  onSubmit: (payload: CreateAssignmentPayload) => Promise<boolean>;
  onClose: () => void;
}

export function CreateAssignmentModal({ selectedOption, existingAssignments, onSubmit, onClose }: CreateAssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState("1");
  const [sequenceNo, setSequenceNo] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedSequenceNo = useMemo(() => {
    const semesterNum = Number(semester);
    const matching = existingAssignments.filter(
      (a) =>
        a.class.id === selectedOption.classId &&
        a.subject.id === selectedOption.subjectId &&
        a.academic_year === selectedOption.academicYear &&
        a.semester === semesterNum,
    );
    return matching.length === 0 ? 1 : Math.max(...matching.map((a) => a.sequence_no)) + 1;
  }, [existingAssignments, selectedOption, semester]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const semesterNum = Number(semester);
    const sequenceNum = Number(sequenceNo);
    if (!Number.isInteger(semesterNum) || semesterNum < 1) {
      setError("Semester must be a positive whole number.");
      return;
    }
    if (!Number.isInteger(sequenceNum) || sequenceNum < 1) {
      setError("Sequence number must be a positive whole number.");
      return;
    }

    setIsSubmitting(true);
    const ok = await onSubmit({
      classId: selectedOption.classId,
      subjectId: selectedOption.subjectId,
      academicYear: selectedOption.academicYear,
      semester: semesterNum,
      sequenceNo: sequenceNum,
      title: title.trim() || undefined,
    });
    setIsSubmitting(false);
    if (ok) onClose();
    else setError("Could not create the assignment. It may already exist with this sequence number.");
  }

  return (
    <Modal title="Create New Assignment" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="-mt-1 text-xs text-slate-500">
          {selectedOption.subjectName} ({selectedOption.subjectCode}) — {selectedOption.departmentCode}{" "}
          {selectedOption.classSection} · AY {selectedOption.academicYear}
        </p>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Assignment Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Graph Traversal Algorithms"
            maxLength={200}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Semester</span>
            <input
              type="number"
              min={1}
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setSequenceNo(String(suggestedSequenceNo));
              }}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Assignment #</span>
            <input
              type="number"
              min={1}
              value={sequenceNo}
              onChange={(e) => setSequenceNo(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        {error && <p className="text-xs font-medium text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isSubmitting ? "Publishing…" : "Publish Assignment"}
        </button>
      </form>
    </Modal>
  );
}

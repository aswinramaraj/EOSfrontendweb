"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useStudentCount } from "@/modules/students/hooks/useStudentCount";
import { useClassSubjects } from "../hooks/useAcademicStructureQueries";
import { useDeleteClass, useUpdateClass } from "../hooks/useAcademicStructureMutations";
import { CannotDeleteModal } from "./CannotDeleteModal";
import { formatBlockers } from "../lib/formatBlockers";
import { fieldErrorStyle, fieldHintStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "../lib/formStyles";
import type { Batch, Course, SchoolClass } from "../types";

interface ClassDialogProps {
  open: boolean;
  onClose: () => void;
  classItem: SchoolClass;
  course: Course;
  batches: Batch[];
  classes: SchoolClass[];
}

export function ClassDialog({ open, onClose, classItem, course, batches, classes }: ClassDialogProps) {
  const { data: studentCountInClass = 0 } = useStudentCount({ class_id: classItem.id });
  const [batchId, setBatchId] = useState(String(classItem.batch_id));
  const [section, setSection] = useState(classItem.section);
  const [semester, setSemester] = useState(classItem.current_semester != null ? String(classItem.current_semester) : "");
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<string[] | null>(null);
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const { data: subjects } = useClassSubjects(classItem.id);
  const { show } = useToast();

  const takenSections = useMemo(
    () =>
      new Set(
        classes
          .filter((c) => c.course_id === course.id && c.batch_id === Number(batchId) && c.id !== classItem.id)
          .map((c) => c.section),
      ),
    [classes, course.id, batchId, classItem.id],
  );

  function handleSave() {
    setError(null);
    const trimmedSection = section.trim().toUpperCase();
    if (!trimmedSection) return setError("Section is required.");
    if (trimmedSection.length > 10) return setError("10 characters max.");
    if (!/^[A-Z0-9]+$/.test(trimmedSection)) return setError("Letters and numbers only.");
    if (takenSections.has(trimmedSection)) return setError(`Section ${trimmedSection} already exists for this batch.`);

    updateClass
      .mutateAsync({
        id: classItem.id,
        input: { batch_id: Number(batchId), section: trimmedSection, current_semester: semester ? Number(semester) : undefined },
      })
      .then(() => {
        show("Class updated", "success");
        onClose();
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      });
  }

  function handleDelete() {
    deleteClass
      .mutateAsync(classItem.id)
      .then(() => {
        show("Deleted", "success");
        onClose();
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.details) {
          setBlockers(formatBlockers(err.details));
        } else {
          show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
        }
      });
  }

  const semesterOptions = Array.from({ length: course.duration_years * 2 }, (_, i) => i + 1);
  const bySemester = new Map<number, typeof subjects>();
  (subjects ?? []).forEach((s) => {
    const list = bySemester.get(s.semester) ?? [];
    list.push(s);
    bySemester.set(s.semester, list);
  });

  return (
    <>
      <Modal open={open} onClose={onClose} title="Edit class" subtitle={`${course.code} · Section ${classItem.section}`} widthClassName="max-w-lg">
        <div style={fieldRowStyle}>
          <label style={fieldLabelStyle}>Batch *</label>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} style={fieldInputStyle()}>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...fieldRowStyle, flex: 1 }}>
            <label style={fieldLabelStyle}>Section *</label>
            <input value={section} onChange={(e) => setSection(e.target.value)} maxLength={10} style={fieldInputStyle()} />
          </div>
          <div style={{ ...fieldRowStyle, flex: 1 }}>
            <label style={fieldLabelStyle}>Current semester</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} style={fieldInputStyle()}>
              <option value="">Not set</option>
              {semesterOptions.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {studentCountInClass > 0 && (
          <p style={fieldHintStyle}>
            {studentCountInClass} student{studentCountInClass === 1 ? "" : "s"} on the roll sits in this class. Renaming the
            section moves all of them.
          </p>
        )}
        {error && <p style={fieldErrorStyle}>{error}</p>}

        {bySemester.size > 0 && (
          <div style={{ marginTop: 16, borderTop: "1px solid #eef1f6", paddingTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".4px", color: "#9aa5b8", marginBottom: 8 }}>
              SUBJECTS (READ-ONLY)
            </p>
            <div style={{ maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from(bySemester.entries())
                .sort(([a], [b]) => a - b)
                .map(([sem, list]) => (
                  <div key={sem}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#77808f", marginBottom: 3 }}>Semester {sem}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {list?.map((s) => (
                        <span
                          key={s.id}
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 5,
                            background: s.is_elective ? "#eef3fe" : "#f1f3f7",
                            color: s.is_elective ? "#5b7fdf" : "#5b6577",
                          }}
                        >
                          {s.subjects.subject_code} · {s.subjects.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div style={{ ...dialogFooterStyle, justifyContent: "space-between" }}>
          <button
            type="button"
            title={studentCountInClass > 0 ? `${studentCountInClass} students in this class — move them first` : "Delete this class"}
            disabled={studentCountInClass > 0 || deleteClass.isPending}
            onClick={handleDelete}
            style={{
              height: 34,
              borderRadius: 8,
              padding: "0 14px",
              fontSize: 12.5,
              fontWeight: 600,
              border: "1px solid #fecaca",
              background: "#fff",
              color: studentCountInClass > 0 ? "#f3b4b4" : "#b91c1c",
              cursor: studentCountInClass > 0 ? "not-allowed" : "pointer",
            }}
          >
            {deleteClass.isPending ? "Deleting…" : "Delete"}
          </button>
          <div style={{ display: "flex", gap: 9 }}>
            <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={updateClass.isPending}>
              Cancel
            </button>
            <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={updateClass.isPending}>
              {updateClass.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </Modal>

      {blockers && (
        <CannotDeleteModal open={!!blockers} onClose={() => setBlockers(null)} label="class" blockers={blockers} />
      )}
    </>
  );
}

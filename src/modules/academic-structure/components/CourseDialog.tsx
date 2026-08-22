"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useCreateCourse, useUpdateCourse } from "../hooks/useAcademicStructureMutations";
import { fieldErrorStyle, fieldHintStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "../lib/formStyles";
import type { Course, Department } from "../types";

interface CourseDialogProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  departments: Department[];
  /** Preselected department when adding from a department's own panel. */
  defaultDepartmentId: number | null;
}

export function CourseDialog({ open, onClose, course, departments, defaultDepartmentId }: CourseDialogProps) {
  const [name, setName] = useState(course?.name ?? "");
  const [code, setCode] = useState(course?.code ?? "");
  const [departmentId, setDepartmentId] = useState<string>(
    course ? String(course.department_id) : defaultDepartmentId != null ? String(defaultDepartmentId) : "",
  );
  const [durationYears, setDurationYears] = useState(course?.duration_years ?? 4);
  const [error, setError] = useState<string | null>(null);
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const { show } = useToast();

  const pending = createCourse.isPending || updateCourse.isPending;

  function handleSave() {
    setError(null);
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName) return setError("A course needs a name.");
    if (trimmedName.length > 150) return setError("The name column holds 150 characters.");
    if (!trimmedCode) return setError("A course needs a code.");
    if (trimmedCode.length > 30) return setError("The code column holds 30 characters.");
    if (!departmentId) return setError("Pick the department this course belongs to.");

    const input = {
      name: trimmedName,
      code: trimmedCode,
      department_id: Number(departmentId),
      duration_years: durationYears,
    };
    const mutation = course ? updateCourse.mutateAsync({ id: course.id, input }) : createCourse.mutateAsync(input);

    mutation
      .then(() => {
        show(course ? "Course updated" : "Course added", "success");
        onClose();
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={course ? "Edit course" : "Add a course"}
      subtitle="The degree a student is admitted into."
      widthClassName="max-w-md"
    >
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="B.E. Computer Science and Engineering"
          maxLength={150}
          style={fieldInputStyle()}
        />
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Code *</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSE-BE" maxLength={30} style={fieldInputStyle()} />
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Department *</label>
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={fieldInputStyle()}>
          <option value="">Select a department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Duration</label>
        <select value={durationYears} onChange={(e) => setDurationYears(Number(e.target.value))} style={fieldInputStyle()}>
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <option key={y} value={y}>
              {y} {y === 1 ? "year" : "years"}
            </option>
          ))}
        </select>
        <p style={fieldHintStyle}>Sets how many semesters a class of this course can be in.</p>
      </div>
      {error && <p style={fieldErrorStyle}>{error}</p>}
      <div style={dialogFooterStyle}>
        <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={pending}>
          Cancel
        </button>
        <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : course ? "Save changes" : "Add course"}
        </button>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useFacultyInDepartment } from "../hooks/useAcademicStructureQueries";
import { useAssignHod } from "../hooks/useAcademicStructureMutations";
import { fieldHintStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "../lib/formStyles";
import type { Department } from "../types";

interface HodPickerDialogProps {
  open: boolean;
  onClose: () => void;
  department: Department;
}

export function HodPickerDialog({ open, onClose, department }: HodPickerDialogProps) {
  const [facultyId, setFacultyId] = useState<string>(
    department.head_of_department_faculty_id != null ? String(department.head_of_department_faculty_id) : "",
  );
  const { data: faculty, isLoading } = useFacultyInDepartment(department.id);
  const assignHod = useAssignHod();
  const { show } = useToast();

  function handleSave() {
    assignHod
      .mutateAsync({ id: department.id, input: { faculty_id: facultyId ? Number(facultyId) : null } })
      .then(() => {
        show(facultyId ? "Head of Department assigned" : "Head of Department cleared", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
      });
  }

  return (
    <Modal open={open} onClose={onClose} title="Head of Department" subtitle={`For ${department.name}`} widthClassName="max-w-md">
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Faculty</label>
        <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} style={fieldInputStyle()} disabled={isLoading}>
          <option value="">No Head of Department</option>
          {faculty?.data.map((f) => (
            <option key={f.id} value={f.id}>
              {[f.prefix, f.first_name, f.last_name].filter(Boolean).join(" ")}
              {f.designation ? ` — ${f.designation}` : ""}
            </option>
          ))}
        </select>
        <p style={fieldHintStyle}>
          {isLoading ? "Loading faculty…" : "Only faculty already in this department can be assigned."}
        </p>
      </div>
      <div style={dialogFooterStyle}>
        <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={assignHod.isPending}>
          Cancel
        </button>
        <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={assignHod.isPending}>
          {assignHod.isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}

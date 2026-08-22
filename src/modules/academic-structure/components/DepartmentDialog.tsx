"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useCreateDepartment, useUpdateDepartment } from "../hooks/useAcademicStructureMutations";
import { fieldErrorStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "../lib/formStyles";
import type { Department } from "../types";

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  /** Present when editing; absent when adding. */
  department: Department | null;
}

/** key-remount pattern for form state: the parent gives this a fresh `key` per open, so state resets without an effect. */
export function DepartmentDialog({ open, onClose, department }: DepartmentDialogProps) {
  const [name, setName] = useState(department?.name ?? "");
  const [code, setCode] = useState(department?.code ?? "");
  const [error, setError] = useState<string | null>(null);
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const { show } = useToast();

  const pending = createDepartment.isPending || updateDepartment.isPending;

  function handleSave() {
    setError(null);
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedName) return setError("A department needs a name.");
    if (trimmedName.length > 150) return setError("The name column holds 150 characters.");
    if (!trimmedCode) return setError("A department needs a code.");
    if (trimmedCode.length > 20) return setError("The code column holds 20 characters.");

    const input = { name: trimmedName, code: trimmedCode };
    const mutation = department
      ? updateDepartment.mutateAsync({ id: department.id, input })
      : createDepartment.mutateAsync(input);

    mutation
      .then(() => {
        show(department ? "Department updated" : "Department added", "success");
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
      title={department ? "Edit department" : "Add a department"}
      subtitle="Departments own courses, and courses own classes."
      widthClassName="max-w-md"
    >
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Computer Science and Engineering"
          maxLength={150}
          style={fieldInputStyle()}
        />
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Code *</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CSE" maxLength={20} style={fieldInputStyle()} />
        <p style={{ fontSize: 11, color: "#8b95a6", marginTop: 4 }}>Unique across the institution.</p>
      </div>
      {error && <p style={fieldErrorStyle}>{error}</p>}
      <div style={dialogFooterStyle}>
        <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={pending}>
          Cancel
        </button>
        <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : department ? "Save changes" : "Add department"}
        </button>
      </div>
    </Modal>
  );
}

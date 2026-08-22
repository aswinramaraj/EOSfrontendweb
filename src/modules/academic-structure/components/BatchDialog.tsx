"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useCreateBatch, useUpdateBatch } from "../hooks/useAcademicStructureMutations";
import { fieldErrorStyle, fieldHintStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "../lib/formStyles";
import type { Batch } from "../types";

interface BatchDialogProps {
  open: boolean;
  onClose: () => void;
  batch: Batch | null;
}

export function BatchDialog({ open, onClose, batch }: BatchDialogProps) {
  const [startYear, setStartYear] = useState(batch ? String(batch.start_year) : "");
  const [endYear, setEndYear] = useState(batch ? String(batch.end_year) : "");
  const [name, setName] = useState(batch?.name ?? "");
  const [nameTouched, setNameTouched] = useState(!!batch);
  const [error, setError] = useState<string | null>(null);
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const { show } = useToast();

  const pending = createBatch.isPending || updateBatch.isPending;

  function handleStartYearChange(value: string) {
    setStartYear(value);
    if (!nameTouched) setName(value && endYear ? `${value} – ${endYear}` : value);
  }

  function handleEndYearChange(value: string) {
    setEndYear(value);
    if (!nameTouched) setName(startYear && value ? `${startYear} – ${value}` : startYear);
  }

  function handleSave() {
    setError(null);
    const start = Number(startYear);
    const end = Number(endYear);
    const trimmedName = name.trim();

    if (!/^\d{4}$/.test(startYear)) return setError("Start year is a four-digit year.");
    if (!/^\d{4}$/.test(endYear)) return setError("End year is a four-digit year.");
    if (end <= start) return setError("The end year has to be after the start year.");
    if (end - start > 6) return setError("A batch longer than six years is almost certainly a typo.");
    if (!trimmedName) return setError("A batch needs a name.");
    if (trimmedName.length > 50) return setError("The name column holds 50 characters.");

    const input = { name: trimmedName, start_year: start, end_year: end };
    const mutation = batch ? updateBatch.mutateAsync({ id: batch.id, input }) : createBatch.mutateAsync(input);

    mutation
      .then(() => {
        show(batch ? "Batch updated" : "Batch added", "success");
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
      title={batch ? "Edit batch" : "Add a batch"}
      subtitle="An intake year, shared across every department."
      widthClassName="max-w-sm"
    >
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ ...fieldRowStyle, flex: 1 }}>
          <label style={fieldLabelStyle}>Start year *</label>
          <input
            value={startYear}
            onChange={(e) => handleStartYearChange(e.target.value)}
            placeholder="2026"
            maxLength={4}
            style={fieldInputStyle()}
          />
        </div>
        <div style={{ ...fieldRowStyle, flex: 1 }}>
          <label style={fieldLabelStyle}>End year *</label>
          <input
            value={endYear}
            onChange={(e) => handleEndYearChange(e.target.value)}
            placeholder="2030"
            maxLength={4}
            style={fieldInputStyle()}
          />
        </div>
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Name *</label>
        <input
          value={name}
          onChange={(e) => {
            setNameTouched(true);
            setName(e.target.value);
          }}
          placeholder="2026 – 2030"
          maxLength={50}
          style={fieldInputStyle()}
        />
        <p style={fieldHintStyle}>How it appears everywhere else.</p>
      </div>
      {error && <p style={fieldErrorStyle}>{error}</p>}
      <div style={dialogFooterStyle}>
        <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={pending}>
          Cancel
        </button>
        <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : batch ? "Save changes" : "Add batch"}
        </button>
      </div>
    </Modal>
  );
}

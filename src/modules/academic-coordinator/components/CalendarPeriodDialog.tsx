"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { fieldErrorStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "@/modules/academic-structure/lib/formStyles";
import { useBatches } from "@/modules/academic-structure/hooks/useAcademicStructureQueries";
import { useCreateCalendarPeriod, useDeleteCalendarPeriod, useUpdateCalendarPeriod } from "../hooks/useAcademicCalendarMutations";
import type { AcademicCalendarPeriod } from "../types";

interface CalendarPeriodDialogProps {
  open: boolean;
  onClose: () => void;
  period: AcademicCalendarPeriod | null;
}

export function CalendarPeriodDialog({ open, onClose, period }: CalendarPeriodDialogProps) {
  const batches = useBatches();
  const { show } = useToast();
  const createPeriod = useCreateCalendarPeriod();
  const updatePeriod = useUpdateCalendarPeriod();
  const deletePeriod = useDeleteCalendarPeriod();

  const [batchId, setBatchId] = useState(period ? String(period.batchId) : "");
  const [semester, setSemester] = useState(period ? String(period.semester) : "1");
  const [startDate, setStartDate] = useState(period?.startDate.slice(0, 10) ?? "");
  const [endDate, setEndDate] = useState(period?.endDate.slice(0, 10) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEdit = period != null;
  const isPending = createPeriod.isPending || updatePeriod.isPending;

  function handleSave() {
    setError(null);
    if (!batchId) return setError("Select a batch.");
    if (!startDate || !endDate) return setError("Start and end dates are required.");
    if (endDate <= startDate) return setError("End date must be after start date.");

    const input = { batch_id: Number(batchId), semester: Number(semester), start_date: startDate, end_date: endDate };

    (isEdit ? updatePeriod.mutateAsync({ id: period.id, input }) : createPeriod.mutateAsync(input))
      .then(() => {
        show(isEdit ? "Calendar period updated" : "Calendar period created", "success");
        onClose();
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again."));
  }

  function handleDelete() {
    if (!period) return;
    deletePeriod
      .mutateAsync(period.id)
      .then(() => {
        show("Calendar period deleted", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        setConfirmingDelete(false);
      });
  }

  return (
    <>
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit calendar period" : "New calendar period"} widthClassName="max-w-md">
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Batch *</label>
        <select value={batchId} onChange={(e) => setBatchId(e.target.value)} style={fieldInputStyle()}>
          <option value="">Select batch…</option>
          {(batches.data ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <div style={fieldRowStyle}>
        <label style={fieldLabelStyle}>Semester *</label>
        <select value={semester} onChange={(e) => setSemester(e.target.value)} style={fieldInputStyle()}>
          {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
            <option key={s} value={s}>
              Semester {s}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ ...fieldRowStyle, flex: 1 }}>
          <label style={fieldLabelStyle}>Start date *</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={fieldInputStyle()} />
        </div>
        <div style={{ ...fieldRowStyle, flex: 1 }}>
          <label style={fieldLabelStyle}>End date *</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={fieldInputStyle()} />
        </div>
      </div>

      {error && <p style={fieldErrorStyle}>{error}</p>}

      <div style={{ ...dialogFooterStyle, justifyContent: isEdit ? "space-between" : "flex-end" }}>
        {isEdit && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={deletePeriod.isPending}
            style={{ ...pageButtonStyle(false), borderColor: "#fecaca", color: "#b91c1c" }}
          >
            {deletePeriod.isPending ? "Deleting…" : "Delete"}
          </button>
        )}
        <div style={{ display: "flex", gap: 9 }}>
          <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create period"}
          </button>
        </div>
      </div>
    </Modal>

    <ConfirmDialog
      open={confirmingDelete}
      title="Delete this calendar period?"
      message="All its published events will also be removed."
      confirmLabel="Delete"
      tone="danger"
      isPending={deletePeriod.isPending}
      onConfirm={handleDelete}
      onClose={() => setConfirmingDelete(false)}
    />
    </>
  );
}

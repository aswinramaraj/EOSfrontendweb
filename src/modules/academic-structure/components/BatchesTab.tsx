"use client";

import { useState } from "react";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { PencilIcon, TrashIcon } from "@/shared/components/icons";
import { useDeleteBatch } from "../hooks/useAcademicStructureMutations";
import { CannotDeleteModal } from "./CannotDeleteModal";
import { formatBlockers } from "../lib/formatBlockers";
import type { Batch, SchoolClass } from "../types";

interface BatchesTabProps {
  batches: Batch[];
  classes: SchoolClass[];
  onAdd?: () => void;
  onEdit?: (batch: Batch) => void;
  /** Hides add/edit/delete affordances — for viewers without write access, e.g. the Academic Coordinator. */
  readOnly?: boolean;
}

export function BatchesTab({ batches, classes, onAdd, onEdit, readOnly = false }: BatchesTabProps) {
  const [blockers, setBlockers] = useState<{ label: string; items: string[] } | null>(null);
  // One mutation instance is shared across every row, so track which row
  // triggered it — otherwise every row's delete button would show "pending"
  // while only one batch is actually being deleted.
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteBatch = useDeleteBatch();
  const { show } = useToast();

  function handleDelete(batch: Batch) {
    setDeletingId(batch.id);
    deleteBatch
      .mutateAsync(batch.id)
      .then(() => show("Deleted", "success"))
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.details) {
          setBlockers({ label: `batch "${batch.name}"`, items: formatBlockers(err.details) });
        } else {
          show(err instanceof ApiError ? err.message : "Something went wrong. Please try again.", "error");
        }
      })
      .finally(() => setDeletingId(null));
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e7ef", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: "1px solid #eef1f6" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>Batches</h2>
          <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#77808f" }}>
            An intake, shared by every department. Classes are created per batch, so this list has to exist before sections can.
          </p>
        </div>
        {!readOnly && (
          <button type="button" style={pageButtonStyle(true)} onClick={onAdd}>
            + Add batch
          </button>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr .8fr .8fr .8fr 1fr",
          gap: 14,
          padding: "10px 18px",
          background: "#f8fafc",
          borderBottom: "1px solid #eaeef4",
          fontSize: 11,
          fontWeight: 650,
          color: "#77808f",
          letterSpacing: ".3px",
        }}
      >
        <div>BATCH</div>
        <div>STARTS</div>
        <div>ENDS</div>
        <div>CLASSES</div>
        <div />
      </div>

      {batches.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#96a0b0", fontSize: 12.5 }}>No batches yet.</div>}

      {batches.map((b) => {
        const classCount = classes.filter((c) => c.batch_id === b.id).length;
        return (
          <div
            key={b.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr .8fr .8fr .8fr 1fr",
              gap: 14,
              alignItems: "center",
              padding: "12px 18px",
              borderBottom: "1px solid #f3f5f9",
              fontSize: 12.5,
            }}
          >
            <div style={{ fontWeight: 600, color: "#14181f" }}>{b.name}</div>
            <div>{b.start_year}</div>
            <div>{b.end_year}</div>
            <div>{classCount || "—"}</div>
            <div style={{ display: "flex", gap: 7, justifyContent: "flex-end" }}>
              {!readOnly && (
                <>
                  <button type="button" onClick={() => onEdit?.(b)} title="Edit" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b)}
                    title={classCount > 0 ? `Has ${classCount} classes — remove those first` : "Delete"}
                    disabled={classCount > 0 || deletingId === b.id}
                    className={`rounded-md p-1.5 ${classCount > 0 || deletingId === b.id ? "cursor-not-allowed text-slate-300" : "text-slate-500 hover:bg-red-50 hover:text-red-600"}`}
                  >
                    {deletingId === b.id ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {!readOnly && blockers && (
        <CannotDeleteModal open={!!blockers} onClose={() => setBlockers(null)} label={blockers.label} blockers={blockers.items} />
      )}
    </div>
  );
}

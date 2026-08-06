"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { feeConcessionsService } from "../../services/fee-concessions.service";
import { FeeConcessionsList } from "./FeeConcessionsList";
import { FeeConcessionFormDialog } from "./FeeConcessionFormDialog";
import { DeleteFeeConcessionDialog } from "./DeleteFeeConcessionDialog";
import type { FeeConcession, FeeConcessionFormValues } from "./types";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; concession: FeeConcession }
  | { mode: "delete"; concession: FeeConcession }
  | null;

interface FeeConcessionsPanelProps {
  feeStructureId: number | null;
  onDataChanged?: () => void;
}

export function FeeConcessionsPanel({ feeStructureId, onDataChanged }: FeeConcessionsPanelProps) {
  const [items, setItems] = useState<FeeConcession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Scoped to this student's own fee structure — GET
  // /fee-structures/:id/concessions — never the global GET /fee-concessions
  // list (that endpoint is untouched; it isn't used anywhere in this panel).
  function fetchList() {
    if (feeStructureId === null) {
      setItems([]);
      setIsLoading(false);
      setLoadError(null);
      return Promise.resolve();
    }

    setIsLoading(true);
    setLoadError(null);

    return feeConcessionsService
      .listByFeeStructure(feeStructureId)
      .then((data) => setItems(data))
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load fee concessions.");
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeStructureId]);

  function handleSubmit(values: FeeConcessionFormValues) {
    if (dialog?.mode === "edit") {
      setIsSubmitting(true);
      setFormError(null);

      feeConcessionsService
        .update(dialog.concession.id, values)
        .then(() => {
          setDialog(null);
          onDataChanged?.();
          return fetchList();
        })
        .catch((err: unknown) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to update fee concession.");
        })
        .finally(() => setIsSubmitting(false));
      return;
    }

    if (feeStructureId === null) {
      setFormError("No fee structure is linked to this student yet.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    feeConcessionsService
      .create(feeStructureId, values.concessionAmount)
      .then(() => {
        setDialog(null);
        onDataChanged?.();
        return fetchList();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to create fee concession.");
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleDeleteConfirm() {
    if (dialog?.mode !== "delete") return;

    setIsDeleting(true);
    setDeleteError(null);

    feeConcessionsService
      .remove(dialog.concession.id)
      .then(() => {
        setDialog(null);
        onDataChanged?.();
        return fetchList();
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete fee concession.");
      })
      .finally(() => setIsDeleting(false));
  }

  function closeDialog() {
    setFormError(null);
    setDeleteError(null);
    setDialog(null);
  }

  return (
    <>
      {isLoading ? (
        <p className="py-8 text-center text-sm text-zinc-500">Loading fee concessions...</p>
      ) : loadError ? (
        <p className="py-8 text-center text-sm text-red-600">{loadError}</p>
      ) : (
        <FeeConcessionsList
          items={items}
          onAdd={() => setDialog({ mode: "create" })}
          onEdit={(concession) => setDialog({ mode: "edit", concession })}
          onDelete={(concession) => setDialog({ mode: "delete", concession })}
        />
      )}

      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <FeeConcessionFormDialog
          concession={dialog.mode === "edit" ? dialog.concession : null}
          error={formError}
          isSubmitting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      )}

      {dialog?.mode === "delete" && (
        <DeleteFeeConcessionDialog
          concession={dialog.concession}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={closeDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

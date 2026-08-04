"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/shared/lib/api-client";
import { educationLoanDDService } from "../../services/education-loan-dd.service";
import { EducationLoanDDList } from "./EducationLoanDDList";
import { EducationLoanDDFormDialog } from "./EducationLoanDDFormDialog";
import { DeleteEducationLoanDDDialog } from "./DeleteEducationLoanDDDialog";
import type { EducationLoanDD, EducationLoanDDFormValues } from "./types";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; dd: EducationLoanDD }
  | { mode: "delete"; dd: EducationLoanDD }
  | null;

interface EducationLoanDDPanelProps {
  demandMappingId: number | null;
  onDataChanged?: () => void;
}

export function EducationLoanDDPanel({ demandMappingId, onDataChanged }: EducationLoanDDPanelProps) {
  const [items, setItems] = useState<EducationLoanDD[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function fetchList() {
    setIsLoading(true);
    setLoadError(null);

    return educationLoanDDService
      .list()
      .then((data) => setItems(data))
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load education loan DDs.");
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchList();
  }, []);

  function handleSubmit(values: EducationLoanDDFormValues) {
    if (dialog?.mode === "edit") {
      setIsSubmitting(true);
      setFormError(null);

      educationLoanDDService
        .update(dialog.dd.id, values)
        .then(() => {
          setDialog(null);
          onDataChanged?.();
          return fetchList();
        })
        .catch((err: unknown) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to update education loan DD.");
        })
        .finally(() => setIsSubmitting(false));
      return;
    }

    if (demandMappingId === null) {
      setFormError("No demand mapping is linked to this student yet.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    educationLoanDDService
      .create(demandMappingId, values)
      .then(() => {
        setDialog(null);
        onDataChanged?.();
        return fetchList();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to create education loan DD.");
      })
      .finally(() => setIsSubmitting(false));
  }

  function handleDeleteConfirm() {
    if (dialog?.mode !== "delete") return;

    setIsDeleting(true);
    setDeleteError(null);

    educationLoanDDService
      .remove(dialog.dd.id)
      .then(() => {
        setDialog(null);
        onDataChanged?.();
        return fetchList();
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete education loan DD.");
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
        <p className="py-8 text-center text-sm text-zinc-500">Loading education loan DDs...</p>
      ) : loadError ? (
        <p className="py-8 text-center text-sm text-red-600">{loadError}</p>
      ) : (
        <EducationLoanDDList
          items={items}
          onAdd={() => setDialog({ mode: "create" })}
          onEdit={(dd) => setDialog({ mode: "edit", dd })}
          onDelete={(dd) => setDialog({ mode: "delete", dd })}
        />
      )}

      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <EducationLoanDDFormDialog
          dd={dialog.mode === "edit" ? dialog.dd : null}
          error={formError}
          isSubmitting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />
      )}

      {dialog?.mode === "delete" && (
        <DeleteEducationLoanDDDialog
          dd={dialog.dd}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={closeDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

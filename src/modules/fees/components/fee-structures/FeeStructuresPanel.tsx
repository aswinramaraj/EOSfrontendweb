"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { PanelSection } from "../PanelSection";
import { LoadingState } from "../fee-payments/LoadingState";
import { feeStructuresService } from "../../services/fee-structures.service";
import { quotasService } from "../../services/quotas.service";
import { demandCategoriesService } from "../../services/demand-categories.service";
import { FeeStructuresTable } from "./FeeStructuresTable";
import { FeeStructureFormDialog } from "./FeeStructureFormDialog";
import { CreateFeeStructureFormDialog } from "./CreateFeeStructureFormDialog";
import { DeleteFeeStructureDialog } from "./DeleteFeeStructureDialog";
import type { FeeStructure, FeeStructureCreateValues, FeeStructureFormValues } from "./types";
import type { Quota } from "../quotas/types";
import type { DemandCategory } from "../demand-categories/types";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; feeStructure: FeeStructure }
  | { mode: "delete"; feeStructure: FeeStructure }
  | null;

export function FeeStructuresPanel() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [quotas, setQuotas] = useState<Quota[]>([]);
  const [demandCategories, setDemandCategories] = useState<DemandCategory[]>([]);
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

    return feeStructuresService
      .list()
      .then((data) => {
        setFeeStructures(data);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load fee structures.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchList();
    quotasService
      .list()
      .then((data) => setQuotas(data))
      .catch(() => setQuotas([]));
    demandCategoriesService
      .list()
      .then((data) => setDemandCategories(data))
      .catch(() => setDemandCategories([]));
  }, []);

  function handleCreateSubmit(values: FeeStructureCreateValues) {
    setIsSubmitting(true);
    setFormError(null);

    feeStructuresService
      .create(values)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to create fee structure.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleEditSubmit(values: FeeStructureFormValues) {
    if (dialog?.mode !== "edit") return;

    setIsSubmitting(true);
    setFormError(null);

    feeStructuresService
      .update(dialog.feeStructure.id, values)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to update fee structure.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleDeleteConfirm() {
    if (dialog?.mode !== "delete") return;

    setIsDeleting(true);
    setDeleteError(null);

    feeStructuresService
      .remove(dialog.feeStructure.id)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete fee structure.");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  }

  function closeDialog() {
    setFormError(null);
    setDeleteError(null);
    setDialog(null);
  }

  return (
    <>
      <PanelSection
        description="Manage fee structures applied to quotas, hostel and transport."
        action={
          <button
            type="button"
            onClick={() => setDialog({ mode: "create" })}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Fee Structure
          </button>
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : loadError ? (
          <p className="py-8 text-center text-sm text-red-600">{loadError}</p>
        ) : (
          <FeeStructuresTable
            feeStructures={feeStructures}
            quotas={quotas}
            onEdit={(feeStructure) => setDialog({ mode: "edit", feeStructure })}
            onDelete={(feeStructure) => setDialog({ mode: "delete", feeStructure })}
          />
        )}
      </PanelSection>

      {dialog?.mode === "create" && (
        <CreateFeeStructureFormDialog
          quotas={quotas}
          demandCategories={demandCategories}
          error={formError}
          isSubmitting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleCreateSubmit}
        />
      )}

      {dialog?.mode === "edit" && (
        <FeeStructureFormDialog
          feeStructure={dialog.feeStructure}
          quotas={quotas}
          error={formError}
          isSubmitting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleEditSubmit}
        />
      )}

      {dialog?.mode === "delete" && (
        <DeleteFeeStructureDialog
          feeStructure={dialog.feeStructure}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={closeDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

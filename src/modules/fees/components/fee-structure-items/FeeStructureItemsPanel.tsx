"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { PanelSection } from "../PanelSection";
import { LoadingState } from "../fee-payments/LoadingState";
import { feeStructureItemsService } from "../../services/fee-structure-items.service";
import { feeStructuresService } from "../../services/fee-structures.service";
import { demandCategoriesService } from "../../services/demand-categories.service";
import { FeeStructureItemsTable } from "./FeeStructureItemsTable";
import { FeeStructureItemFormDialog } from "./FeeStructureItemFormDialog";
import { DeleteFeeStructureItemDialog } from "./DeleteFeeStructureItemDialog";
import type { FeeStructureItem, FeeStructureItemFormValues } from "./types";
import type { FeeStructure } from "../fee-structures/types";
import type { DemandCategory } from "../demand-categories/types";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; item: FeeStructureItem }
  | { mode: "delete"; item: FeeStructureItem }
  | null;

export function FeeStructureItemsPanel() {
  const [items, setItems] = useState<FeeStructureItem[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
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

    return feeStructureItemsService
      .list()
      .then((data) => {
        setItems(data);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load fee structure items.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchList();
    feeStructuresService
      .list()
      .then((data) => setFeeStructures(data))
      .catch(() => setFeeStructures([]));
    demandCategoriesService
      .list()
      .then((data) => setDemandCategories(data))
      .catch(() => setDemandCategories([]));
  }, []);

  function handleCreateOrEditSubmit(values: FeeStructureItemFormValues) {
    if (dialog?.mode === "edit") {
      setIsSubmitting(true);
      setFormError(null);

      feeStructureItemsService
        .update(dialog.item.id, values)
        .then(() => {
          setDialog(null);
          return fetchList();
        })
        .catch((err: unknown) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to update fee structure item.");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    feeStructureItemsService
      .create(values)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to create fee structure item.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleDeleteConfirm() {
    if (dialog?.mode !== "delete") return;

    setIsDeleting(true);
    setDeleteError(null);

    feeStructureItemsService
      .remove(dialog.item.id)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete fee structure item.");
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
        description="Manage the demand category amounts within each fee structure."
        action={
          <button
            type="button"
            onClick={() => setDialog({ mode: "create" })}
            className="flex items-center gap-1.5 rounded-lg bg-[#2F6FE0] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Item
          </button>
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : loadError ? (
          <p className="py-8 text-center text-sm text-red-600">{loadError}</p>
        ) : (
          <FeeStructureItemsTable
            items={items}
            feeStructures={feeStructures}
            demandCategories={demandCategories}
            onEdit={(item) => setDialog({ mode: "edit", item })}
            onDelete={(item) => setDialog({ mode: "delete", item })}
          />
        )}
      </PanelSection>

      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <FeeStructureItemFormDialog
          item={dialog.mode === "edit" ? dialog.item : null}
          feeStructures={feeStructures}
          demandCategories={demandCategories}
          error={formError}
          isSubmitting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleCreateOrEditSubmit}
        />
      )}

      {dialog?.mode === "delete" && (
        <DeleteFeeStructureItemDialog
          item={dialog.item}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={closeDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

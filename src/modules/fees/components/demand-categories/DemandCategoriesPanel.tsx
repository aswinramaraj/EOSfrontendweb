"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { PanelSection } from "../PanelSection";
import { LoadingState } from "../fee-payments/LoadingState";
import { demandCategoriesService } from "../../services/demand-categories.service";
import { DemandCategoriesTable } from "./DemandCategoriesTable";
import { DemandCategoryFormDialog } from "./DemandCategoryFormDialog";
import { DeleteDemandCategoryDialog } from "./DeleteDemandCategoryDialog";
import type { DemandCategory } from "./types";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; category: DemandCategory }
  | { mode: "delete"; category: DemandCategory }
  | null;

export function DemandCategoriesPanel() {
  const [categories, setCategories] = useState<DemandCategory[]>([]);
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

    return demandCategoriesService
      .list()
      .then((data) => {
        setCategories(data);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load demand categories.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    fetchList();
  }, []);

  function handleCreateOrEditSubmit(name: string) {
    if (dialog?.mode === "edit") {
      setIsSubmitting(true);
      setFormError(null);

      demandCategoriesService
        .update(dialog.category.id, name)
        .then(() => {
          setDialog(null);
          return fetchList();
        })
        .catch((err: unknown) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to update demand category.");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    demandCategoriesService
      .create(name)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to create demand category.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleDeleteConfirm() {
    if (dialog?.mode !== "delete") return;

    setIsDeleting(true);
    setDeleteError(null);

    demandCategoriesService
      .remove(dialog.category.id)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete demand category.");
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
        description="Manage the demand categories used across fee structures."
        action={
          <button
            type="button"
            onClick={() => setDialog({ mode: "create" })}
            className="flex items-center gap-1.5 rounded-lg bg-[#2F6FE0] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Category
          </button>
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : loadError ? (
          <p className="py-8 text-center text-sm text-red-600">{loadError}</p>
        ) : (
          <DemandCategoriesTable
            categories={categories}
            onEdit={(category) => setDialog({ mode: "edit", category })}
            onDelete={(category) => setDialog({ mode: "delete", category })}
          />
        )}
      </PanelSection>

      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <DemandCategoryFormDialog
          category={dialog.mode === "edit" ? dialog.category : null}
          error={formError}
          isSubmitting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleCreateOrEditSubmit}
        />
      )}

      {dialog?.mode === "delete" && (
        <DeleteDemandCategoryDialog
          category={dialog.category}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={closeDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

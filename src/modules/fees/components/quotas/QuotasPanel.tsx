"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { PanelSection } from "../PanelSection";
import { LoadingState } from "../fee-payments/LoadingState";
import { quotasService } from "../../services/quotas.service";
import { QuotasTable } from "./QuotasTable";
import { QuotaFormDialog } from "./QuotaFormDialog";
import { DeleteQuotaDialog } from "./DeleteQuotaDialog";
import type { Quota } from "./types";

type DialogState =
  | { mode: "create" }
  | { mode: "edit"; quota: Quota }
  | { mode: "delete"; quota: Quota }
  | null;

export function QuotasPanel() {
  const [quotas, setQuotas] = useState<Quota[]>([]);
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

    return quotasService
      .list()
      .then((data) => {
        setQuotas(data);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load quotas.");
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

      quotasService
        .update(dialog.quota.id, name)
        .then(() => {
          setDialog(null);
          return fetchList();
        })
        .catch((err: unknown) => {
          setFormError(err instanceof ApiError ? err.message : "Failed to update quota.");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    quotasService
      .create(name)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setFormError(err instanceof ApiError ? err.message : "Failed to create quota.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }

  function handleDeleteConfirm() {
    if (dialog?.mode !== "delete") return;

    setIsDeleting(true);
    setDeleteError(null);

    quotasService
      .remove(dialog.quota.id)
      .then(() => {
        setDialog(null);
        return fetchList();
      })
      .catch((err: unknown) => {
        setDeleteError(err instanceof ApiError ? err.message : "Failed to delete quota.");
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
        description="Manage the quotas used for fee structures and students."
        action={
          <button
            type="button"
            onClick={() => setDialog({ mode: "create" })}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Quota
          </button>
        }
      >
        {isLoading ? (
          <LoadingState />
        ) : loadError ? (
          <p className="py-8 text-center text-sm text-red-600">{loadError}</p>
        ) : (
          <QuotasTable
            quotas={quotas}
            onEdit={(quota) => setDialog({ mode: "edit", quota })}
            onDelete={(quota) => setDialog({ mode: "delete", quota })}
          />
        )}
      </PanelSection>

      {(dialog?.mode === "create" || dialog?.mode === "edit") && (
        <QuotaFormDialog
          quota={dialog.mode === "edit" ? dialog.quota : null}
          error={formError}
          isSubmitting={isSubmitting}
          onClose={closeDialog}
          onSubmit={handleCreateOrEditSubmit}
        />
      )}

      {dialog?.mode === "delete" && (
        <DeleteQuotaDialog
          quota={dialog.quota}
          error={deleteError}
          isDeleting={isDeleting}
          onCancel={closeDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDeleteRoomType, useRoomTypes } from "../../hooks/useRoomTypes";
import { RoomTypeFormModal } from "./RoomTypeFormModal";
import type { RoomType } from "../../types/rooms";

export function RoomTypesPanel() {
  const [formTarget, setFormTarget] = useState<RoomType | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useRoomTypes();
  const deleteRoomType = useDeleteRoomType();

  const columns: DataTableColumn<RoomType>[] = [
    { key: "name", header: "Room type" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit room type"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete room type"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteRoomType.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Room type deleted.", "success");
        setDeleteTarget(null);
      },
      onError: (err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      },
    });
  }

  return (
    <div>
      <PageHeader
        title="Room types"
        description="Sharing types used to classify rooms (e.g. Single, Double, Triple)."
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add room type
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={
          error instanceof ApiError ? error.message : error ? "Failed to load room types." : null
        }
        emptyMessage="No room types yet."
      />

      <RoomTypeFormModal
        open={formTarget !== null}
        roomType={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete room type"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteRoomType.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

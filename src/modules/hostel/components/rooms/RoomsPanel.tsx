"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useHostels } from "../../hooks/useHostels";
import { useDeleteRoom, useRooms } from "../../hooks/useRooms";
import { useRoomTypes } from "../../hooks/useRoomTypes";
import { RoomFormModal } from "./RoomFormModal";
import type { Room } from "../../types/rooms";

export function RoomsPanel() {
  const [hostelId, setHostelId] = useState<number | undefined>(undefined);
  const [formTarget, setFormTarget] = useState<Room | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const { show } = useToast();

  const { data: hostels } = useHostels();
  const { data: roomTypes } = useRoomTypes();
  const { data, isLoading, error } = useRooms(hostelId);
  const deleteRoom = useDeleteRoom();

  const hostelName = (id: number) => hostels?.find((h) => h.id === id)?.name ?? "—";
  const roomTypeName = (id: number) => roomTypes?.find((rt) => rt.id === id)?.name ?? "—";

  const columns: DataTableColumn<Room>[] = [
    { key: "room_number", header: "Room" },
    { key: "hostel", header: "Hostel", render: (row) => hostelName(row.hostel_id) },
    { key: "room_type", header: "Sharing", render: (row) => roomTypeName(row.room_type_id) },
    { key: "capacity", header: "Capacity" },
    { key: "occupied", header: "Occupied" },
    { key: "vacant", header: "Vacant" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit room"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete room"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteRoom.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Room deleted.", "success");
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
        title="Rooms"
        description="Bed-level allotment across all blocks."
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add room
          </Button>
        }
      />

      <div className="mb-4">
        <SelectInput
          className="w-auto"
          value={hostelId ?? ""}
          onChange={(e) => setHostelId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">All hostels</option>
          {hostels?.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.code})
            </option>
          ))}
        </SelectInput>
      </div>

      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load rooms." : null}
        emptyMessage="No rooms yet."
      />

      <RoomFormModal
        open={formTarget !== null}
        room={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete room"
        message={`Delete room "${deleteTarget?.room_number}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteRoom.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

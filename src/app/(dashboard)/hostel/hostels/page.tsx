"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useDeleteHostel, useHostels } from "@/modules/hostel/hooks/useHostels";
import { HostelFormModal } from "@/modules/hostel/components/hostels/HostelFormModal";
import type { Hostel, HostelWing } from "@/modules/hostel/types/hostels";

export default function HostelsPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [wing, setWing] = useState<HostelWing | "">("");
  const [formTarget, setFormTarget] = useState<Hostel | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Hostel | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useHostels({
    q: debouncedQuery || undefined,
    wing: wing || undefined,
  });
  const deleteHostel = useDeleteHostel();

  const columns: DataTableColumn<Hostel>[] = [
    {
      key: "name",
      header: "Block",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs capitalize text-slate-500">
            {row.code} · {row.wing}
          </p>
        </div>
      ),
    },
    { key: "room_count", header: "Rooms" },
    { key: "capacity", header: "Capacity" },
    { key: "occupied", header: "Occupied" },
    { key: "vacant", header: "Vacant" },
    { key: "occupancy_pct", header: "Occupancy %", render: (row) => `${row.occupancy_pct}%` },
    { key: "warden", header: "Warden", render: (row) => row.warden?.email ?? "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit hostel"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete hostel"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteHostel.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Hostel deleted.", "success");
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
        title="Hostel details"
        description="Create, amend and retire hostel block records."
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add hostel
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Search by name or code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <SelectInput
          className="w-auto"
          value={wing}
          onChange={(e) => setWing(e.target.value as HostelWing | "")}
        >
          <option value="">All wings</option>
          <option value="boys">Boys</option>
          <option value="girls">Girls</option>
        </SelectInput>
      </div>

      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load hostels." : null}
        emptyMessage="No hostel blocks yet."
      />

      <HostelFormModal
        open={formTarget !== null}
        hostel={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete hostel"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteHostel.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useDeleteRack, useRacks } from "../../hooks/useRacks";
import { RackFormModal } from "./RackFormModal";
import type { Rack } from "../../types/racks";

const PAGE_SIZE = 20;

export function RacksPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<Rack | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rack | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useRacks({
    q: debouncedQuery || undefined,
    page,
    page_size: PAGE_SIZE,
  });
  const deleteRack = useDeleteRack();

  const columns: DataTableColumn<Rack>[] = [
    { key: "rack_code", header: "Rack code" },
    { key: "shelves", header: "Shelves", render: (row) => row.shelves ?? "—" },
    { key: "subject_range", header: "Subject range", render: (row) => row.subject_range ?? "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit rack"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete rack"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteRack.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Rack deleted.", "success");
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
        title="Racks"
        description="Shelf ranges books are physically stored on."
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add rack
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchInput
          placeholder="Search racks"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={
          error instanceof ApiError ? error.message : error ? "Failed to load racks." : null
        }
        emptyMessage="No racks yet."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <RackFormModal
        open={formTarget !== null}
        rack={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete rack"
        message={`Delete rack "${deleteTarget?.rack_code}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteRack.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCategories, useDeleteCategory } from "../../hooks/useCategories";
import { CategoryFormModal } from "./CategoryFormModal";
import type { BookCategory } from "../../types/categories";

export function CategoriesPanel() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [formTarget, setFormTarget] = useState<BookCategory | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BookCategory | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useCategories(debouncedQuery || undefined);
  const deleteCategory = useDeleteCategory();

  const columns: DataTableColumn<BookCategory>[] = [
    { key: "name", header: "Category" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit category"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete category"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteCategory.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Category deleted.", "success");
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
        title="Categories"
        description="Subject categories used to classify books and eBooks."
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add category
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchInput
          placeholder="Search categories"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={
          error instanceof ApiError
            ? error.message
            : error
              ? "Failed to load categories."
              : null
        }
        emptyMessage="No categories yet."
      />

      <CategoryFormModal
        open={formTarget !== null}
        category={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete category"
        message={`Delete "${deleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteCategory.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

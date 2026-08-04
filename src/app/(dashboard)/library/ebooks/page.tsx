"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCategories } from "@/modules/library/hooks/useCategories";
import { useEResources } from "@/modules/library/hooks/useEResources";
import { useDeleteEResource } from "@/modules/library/hooks/useEResourceMutations";
import { EResourceFormModal } from "@/modules/library/components/ebooks/EResourceFormModal";
import type { EResource, EResourcePublishState } from "@/modules/library/types/e-resources";

const PAGE_SIZE = 20;
type PublishFilter = "all" | EResourcePublishState;

export default function EBooksPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [publishFilter, setPublishFilter] = useState<PublishFilter>("all");
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<EResource | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EResource | null>(null);
  const { show } = useToast();

  const { data: categories } = useCategories();
  const { data, isLoading, error } = useEResources({
    q: debouncedQuery || undefined,
    category_id: categoryId,
    publish_state: publishFilter === "all" ? undefined : publishFilter,
    page,
    page_size: PAGE_SIZE,
  });
  const deleteResource = useDeleteEResource();

  const columns: DataTableColumn<EResource>[] = [
    { key: "title", header: "eBook" },
    { key: "format", header: "Format", render: (row) => row.format ?? "—" },
    {
      key: "file_size_bytes",
      header: "Size",
      render: (row) => (row.file_size_bytes ? `${(row.file_size_bytes / 1_000_000).toFixed(1)} MB` : "—"),
    },
    { key: "category_name", header: "Category", render: (row) => row.category_name ?? "—" },
    {
      key: "publish_state",
      header: "Status",
      render: (row) => (
        <StatusPill tone={row.publish_state === "published" ? "green" : "slate"}>
          {row.publish_state === "published" ? "Published" : "Draft"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit eBook"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete eBook"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteResource.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("eBook deleted.", "success");
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
        title="eBooks"
        description="Digital copies available to members through the ERP student portal."
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add eBook
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Title"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <SelectInput
            className="w-auto"
            value={categoryId ?? ""}
            onChange={(e) => {
              setCategoryId(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectInput>
          <SegmentedControl
            options={[
              { value: "all", label: "All" },
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ]}
            value={publishFilter}
            onChange={(v) => {
              setPublishFilter(v);
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load eBooks." : null}
        emptyMessage="No eBooks found."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <EResourceFormModal
        open={formTarget !== null}
        resource={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete eBook"
        message={`Delete "${deleteTarget?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteResource.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

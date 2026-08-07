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
import { useBooks } from "@/modules/library/hooks/useBooks";
import { useDeleteBook } from "@/modules/library/hooks/useBookMutations";
import { BookFormModal } from "@/modules/library/components/books/BookFormModal";
import { BookFilters, type BookFiltersValue } from "@/modules/library/components/books/BookFilters";
import type { Book } from "@/modules/library/types/books";

const PAGE_SIZE = 20;

export default function BooksPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [filters, setFilters] = useState<BookFiltersValue>({});
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<Book | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useBooks({
    q: debouncedQuery || undefined,
    ...filters,
    page,
    page_size: PAGE_SIZE,
  });
  const deleteBook = useDeleteBook();

  const columns: DataTableColumn<Book>[] = [
    {
      key: "title",
      header: "Book",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500">{row.author ?? "Unknown author"}</p>
        </div>
      ),
    },
    {
      key: "qr_code",
      header: "ISBN / accession",
      render: (row) => (
        <div>
          <p>{row.qr_code}</p>
          {row.isbn && <p className="text-xs text-slate-500">{row.isbn}</p>}
        </div>
      ),
    },
    { key: "category_name", header: "Category" },
    { key: "department", header: "Department", render: (row) => row.department?.name ?? "—" },
    { key: "rack", header: "Rack", render: (row) => row.rack?.rack_code ?? "—" },
    {
      key: "copies",
      header: "Copies",
      render: (row) => `${row.available_copies} / ${row.total_copies}`,
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
            aria-label="Edit book"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete book"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteBook.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Book deleted.", "success");
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
        title="Books"
        description="Every physical title with its live copy position."
        actions={
          <Button variant="primary" onClick={() => setFormTarget("new")}>
            <PlusIcon className="h-4 w-4" /> Add book
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Title, author, ISBN, accession or publisher"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <BookFilters
          value={filters}
          onChange={(next) => {
            setFilters(next);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load books." : null}
        emptyMessage="No books found."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <BookFormModal
        open={formTarget !== null}
        book={formTarget === "new" ? null : formTarget}
        onClose={() => setFormTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete book"
        message={`Delete "${deleteTarget?.title}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteBook.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

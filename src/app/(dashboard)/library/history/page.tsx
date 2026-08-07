"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useBorrowRecords } from "@/modules/library/hooks/useBorrowRecords";
import { useDeleteBorrowRecord } from "@/modules/library/hooks/useBorrowRecordMutations";
import {
  borrowStatusLabel,
  borrowStatusTone,
  borrowerName,
  formatCurrency,
  formatDate,
} from "@/modules/library/lib/borrow-record-format";
import type { BorrowRecord, BorrowStatusFilter } from "@/modules/library/types/borrow-records";

const PAGE_SIZE = 20;
type StatusTab = "all" | BorrowStatusFilter;

export default function BorrowingHistoryPage() {
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BorrowRecord | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useBorrowRecords({
    status: statusTab === "all" ? undefined : statusTab,
    page,
    page_size: PAGE_SIZE,
  });
  const deleteRecord = useDeleteBorrowRecord();

  const columns: DataTableColumn<BorrowRecord>[] = [
    {
      key: "book",
      header: "Book",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.book.title}</p>
          <p className="text-xs text-slate-500">{row.book.qr_code}</p>
        </div>
      ),
    },
    { key: "borrower", header: "Borrower", render: (row) => borrowerName(row) },
    { key: "borrowed_date", header: "Borrowed", render: (row) => formatDate(row.borrowed_date) },
    { key: "due_date", header: "Due", render: (row) => formatDate(row.due_date) },
    { key: "returned_date", header: "Returned", render: (row) => formatDate(row.returned_date) },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusPill tone={borrowStatusTone(row)}>{borrowStatusLabel(row)}</StatusPill>
      ),
    },
    { key: "fine_amount", header: "Fine", align: "right", render: (row) => formatCurrency(row.fine_amount) },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        row.status === "borrowed" ? (
          <button
            onClick={() => setDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete borrow record"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteRecord.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Borrow record deleted.", "success");
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
        title="Borrowing history"
        description="Every borrowing closed or open — borrowed, returned, overdue and lost, with how each was settled."
      />

      <div className="mb-4">
        <SegmentedControl<StatusTab>
          options={[
            { value: "all", label: "All" },
            { value: "borrowed", label: "Borrowed" },
            { value: "returned", label: "Returned" },
            { value: "overdue", label: "Overdue" },
            { value: "lost", label: "Lost" },
            { value: "damaged", label: "Damaged" },
          ]}
          value={statusTab}
          onChange={(v) => {
            setStatusTab(v);
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
          error instanceof ApiError ? error.message : error ? "Failed to load borrowing history." : null
        }
        emptyMessage="No borrow records found."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete borrow record"
        message={`Delete this borrow record for "${deleteTarget?.book.title}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteRecord.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

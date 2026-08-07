"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useBorrowRecords } from "@/modules/library/hooks/useBorrowRecords";
import { useUpdateBorrowRecord } from "@/modules/library/hooks/useBorrowRecordMutations";
import {
  borrowStatusLabel,
  borrowStatusTone,
  borrowerName,
  formatDate,
} from "@/modules/library/lib/borrow-record-format";
import type { BorrowRecord, BorrowRecordAction } from "@/modules/library/types/borrow-records";

const PAGE_SIZE = 20;

const ACTION_COPY: Record<BorrowRecordAction, { title: string; verb: string; tone: "primary" | "danger" }> = {
  return: { title: "Return book", verb: "Return", tone: "primary" },
  renew: { title: "Renew book", verb: "Renew", tone: "primary" },
  damaged: { title: "Mark as damaged", verb: "Mark damaged", tone: "danger" },
  lost: { title: "Mark as lost", verb: "Mark lost", tone: "danger" },
};

interface PendingAction {
  record: BorrowRecord;
  action: BorrowRecordAction;
}

export default function ReturnsPage() {
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useBorrowRecords({
    status: "borrowed",
    page,
    page_size: PAGE_SIZE,
  });
  const updateRecord = useUpdateBorrowRecord();

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
    {
      key: "issue",
      header: "Issue / renewals",
      render: (row) => `${formatDate(row.borrowed_date)} · ${row.renewal_count} renewal(s)`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill tone={borrowStatusTone(row)}>{borrowStatusLabel(row)}</StatusPill>,
    },
    { key: "due_date", header: "Due date", render: (row) => formatDate(row.due_date) },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="primary" onClick={() => setPending({ record: row, action: "return" })}>
            Return
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setPending({ record: row, action: "renew" })}>
            Renew
          </Button>
          <Button size="sm" variant="danger" onClick={() => setPending({ record: row, action: "damaged" })}>
            Damaged
          </Button>
          <Button size="sm" variant="danger" onClick={() => setPending({ record: row, action: "lost" })}>
            Lost
          </Button>
        </div>
      ),
    },
  ];

  function handleConfirm() {
    if (!pending) return;
    updateRecord.mutate(
      { id: pending.record.id, input: { action: pending.action } },
      {
        onSuccess: () => {
          show(`${ACTION_COPY[pending.action].verb} recorded for "${pending.record.book.title}".`, "success");
          setPending(null);
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Returns & renewals"
        description="Receive copies, renew borrowings and settle overdue, lost or damaged items."
      />

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load borrowed books." : null}
        emptyMessage="No books currently borrowed."
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
        open={pending !== null}
        title={pending ? ACTION_COPY[pending.action].title : ""}
        message={
          pending
            ? `${ACTION_COPY[pending.action].verb} "${pending.record.book.title}" for ${borrowerName(pending.record)}?`
            : ""
        }
        confirmLabel={pending ? ACTION_COPY[pending.action].verb : "Confirm"}
        tone={pending ? ACTION_COPY[pending.action].tone : "primary"}
        isPending={updateRecord.isPending}
        onConfirm={handleConfirm}
        onClose={() => setPending(null)}
      />
    </div>
  );
}

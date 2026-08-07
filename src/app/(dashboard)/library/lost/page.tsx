"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useBorrowRecords } from "@/modules/library/hooks/useBorrowRecords";
import {
  useCreateReplacementIndent,
  useSettleCharge,
} from "@/modules/library/hooks/useBorrowRecordMutations";
import { borrowerName, formatCurrency, formatDate } from "@/modules/library/lib/borrow-record-format";
import type { BorrowRecord } from "@/modules/library/types/borrow-records";

const PAGE_SIZE = 20;
type CauseTab = "lost" | "damaged";
type SettlementTab = "unsettled" | "settled";

export default function LostAndDamagedPage() {
  const [causeTab, setCauseTab] = useState<CauseTab>("lost");
  const [settlementTab, setSettlementTab] = useState<SettlementTab>("unsettled");
  const [page, setPage] = useState(1);
  const [settleTarget, setSettleTarget] = useState<BorrowRecord | null>(null);
  const { show } = useToast();

  const { data, isLoading, error } = useBorrowRecords({
    status: causeTab,
    damage_lost_settled: settlementTab === "settled",
    page,
    page_size: PAGE_SIZE,
  });
  const settleCharge = useSettleCharge();
  const createReplacementIndent = useCreateReplacementIndent();

  const columns: DataTableColumn<BorrowRecord>[] = [
    { key: "accession", header: "Accession", render: (row) => row.book.qr_code },
    { key: "title", header: "Title", render: (row) => row.book.title },
    { key: "member", header: "Member", render: (row) => borrowerName(row) },
    {
      key: "declared",
      header: "Declared",
      render: (row) => formatDate(row.damage_lost_declared_at),
    },
    {
      key: "cause",
      header: "Cause",
      render: (row) => (
        <StatusPill tone="red">{row.is_lost ? "Lost" : "Damaged"}</StatusPill>
      ),
    },
    {
      key: "charge",
      header: "Charge",
      align: "right",
      render: (row) => formatCurrency(row.damage_lost_charge_amount),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        settlementTab === "unsettled" ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="primary" onClick={() => setSettleTarget(row)}>
              Collect
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isPending={
                createReplacementIndent.isPending && createReplacementIndent.variables === row.id
              }
              onClick={() => handleReplacementIndent(row)}
            >
              Replacement
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">{formatDate(row.damage_lost_settled_at)}</span>
        ),
    },
  ];

  function handleSettleConfirm() {
    if (!settleTarget) return;
    settleCharge.mutate(settleTarget.id, {
      onSuccess: () => {
        show(`Charge settled for "${settleTarget.book.title}".`, "success");
        setSettleTarget(null);
      },
      onError: (err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      },
    });
  }

  function handleReplacementIndent(row: BorrowRecord) {
    createReplacementIndent.mutate(row.id, {
      onSuccess: (result) => show(result.message, "success"),
      onError: (err: unknown) =>
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  return (
    <div>
      <PageHeader
        title="Lost & damaged books"
        description="Copies written off the shelf — what was charged, what was recovered and what is still open."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SegmentedControl<CauseTab>
          options={[
            { value: "lost", label: "Lost" },
            { value: "damaged", label: "Damaged" },
          ]}
          value={causeTab}
          onChange={(v) => {
            setCauseTab(v);
            setPage(1);
          }}
        />
        <SegmentedControl<SettlementTab>
          options={[
            { value: "unsettled", label: "Unsettled" },
            { value: "settled", label: "Settled" },
          ]}
          value={settlementTab}
          onChange={(v) => {
            setSettlementTab(v);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load records." : null}
        emptyMessage="No records found."
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
        open={settleTarget !== null}
        title="Collect charge"
        message={`Collect ${formatCurrency(settleTarget?.damage_lost_charge_amount ?? null)} from ${settleTarget ? borrowerName(settleTarget) : ""} for "${settleTarget?.book.title}"?`}
        confirmLabel="Collect charge"
        isPending={settleCharge.isPending}
        onConfirm={handleSettleConfirm}
        onClose={() => setSettleTarget(null)}
      />
    </div>
  );
}

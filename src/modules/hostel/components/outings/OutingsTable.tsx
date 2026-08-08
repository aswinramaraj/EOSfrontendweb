"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useDecideOuting } from "../../hooks/useOutings";
import { formatDate } from "../../lib/format";
import type { Outing, OutingDecision } from "../../types/outings";

const STATUS_TONE: Record<Outing["status"], PillTone> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

interface OutingsTableProps {
  outings: Outing[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

// Shared by both the Approvals page (status=pending) and the Leave requests
// page (full history) — the backend has one outings resource, not two, so
// this table (and its decide action) is reused rather than duplicated.
export function OutingsTable({ outings, isLoading, error, emptyMessage }: OutingsTableProps) {
  const [pending, setPending] = useState<{ outing: Outing; decision: OutingDecision } | null>(
    null,
  );
  const decideOuting = useDecideOuting();
  const { show } = useToast();

  const columns: DataTableColumn<Outing>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.student.name}</p>
          <p className="text-xs text-slate-500">
            {row.student.student_id_no}
            {row.room_number ? ` · ${row.room_number}` : ""}
          </p>
        </div>
      ),
    },
    { key: "hostel", header: "Block", render: (row) => row.hostel?.name ?? "—" },
    { key: "from_date", header: "From", render: (row) => `${formatDate(row.from_date)} · ${row.start_time}` },
    {
      key: "to_date",
      header: "To",
      render: (row) => `${formatDate(row.to_date)}${row.return_time ? ` · ${row.return_time}` : ""}`,
    },
    { key: "reason", header: "Reason", render: (row) => row.reason ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill tone={STATUS_TONE[row.status]}>{row.status}</StatusPill>,
    },
    {
      key: "decided_by",
      header: "Decided by",
      render: (row) => row.approved_by_warden ?? "—",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        row.status === "pending" ? (
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="primary" onClick={() => setPending({ outing: row, decision: "approved" })}>
              Approve
            </Button>
            <Button size="sm" variant="danger" onClick={() => setPending({ outing: row, decision: "rejected" })}>
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  function handleConfirm() {
    if (!pending) return;
    decideOuting.mutate(
      { id: pending.outing.id, decision: pending.decision },
      {
        onSuccess: () => {
          show(`Request ${pending.decision} for ${pending.outing.student.name}.`, "success");
          setPending(null);
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        rows={outings}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error ?? null}
        emptyMessage={emptyMessage ?? "No requests found."}
      />

      <ConfirmDialog
        open={pending !== null}
        title={pending?.decision === "approved" ? "Approve request" : "Reject request"}
        message={`${pending?.decision === "approved" ? "Approve" : "Reject"} the outing request from ${pending?.outing.student.name}?`}
        confirmLabel={pending?.decision === "approved" ? "Approve" : "Reject"}
        tone={pending?.decision === "rejected" ? "danger" : "primary"}
        isPending={decideOuting.isPending}
        onConfirm={handleConfirm}
        onClose={() => setPending(null)}
      />
    </>
  );
}

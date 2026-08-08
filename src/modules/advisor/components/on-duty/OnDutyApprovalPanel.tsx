"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useOds, useFacultyApproveOd } from "../../hooks/useOds";
import type { OdApprovalStatus, StudentOd } from "../../types";

const STATUS_TONE: Record<OdApprovalStatus, "amber" | "green" | "red"> = {
  pending: "amber",
  approved: "green",
  rejected: "red",
};

export function OnDutyApprovalPanel() {
  const { show } = useToast();
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const status = tab === "pending" ? "pending" : undefined;
  const { data, isLoading, error } = useOds({ status: status as OdApprovalStatus | undefined, limit: 50 });
  const approve = useFacultyApproveOd();

  const rows = (data?.data ?? []).filter((o) =>
    tab === "pending" ? o.mentor_approval_status === "pending" : o.mentor_approval_status !== "pending",
  );

  function decide(id: number, decision: "approved" | "rejected") {
    approve
      .mutateAsync({ id, decision })
      .then(() => show(decision === "approved" ? "On-duty request approved." : "On-duty request rejected.", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  const columns: DataTableColumn<StudentOd>[] = [
    { key: "creator", header: "Requested by", render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.creator.name}</p>
        <p className="text-xs text-slate-400">{row.creator.student_id_no} · {row.member_count} member(s)</p>
      </div>
    ) },
    { key: "from_date", header: "From", render: (row) => new Date(row.from_date).toLocaleDateString() },
    { key: "to_date", header: "To", render: (row) => new Date(row.to_date).toLocaleDateString() },
    { key: "reason", header: "Reason", render: (row) => row.reason ?? "—" },
    ...(tab === "history"
      ? [{
          key: "status",
          header: "Status",
          render: (row: StudentOd) => (
            <StatusPill tone={STATUS_TONE[row.mentor_approval_status]}>{row.mentor_approval_status}</StatusPill>
          ),
        }]
      : []),
    ...(tab === "pending"
      ? [{
          key: "actions",
          header: "",
          align: "right" as const,
          render: (row: StudentOd) => (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="secondary" onClick={() => decide(row.id, "rejected")} isPending={approve.isPending}>
                Reject
              </Button>
              <Button size="sm" variant="primary" onClick={() => decide(row.id, "approved")} isPending={approve.isPending}>
                Approve
              </Button>
            </div>
          ),
        }]
      : []),
  ];

  return (
    <div>
      <PageHeader title="On-duty approval" description="Review on-duty requests raised by your mentee students." />

      <div className="mb-4">
        <SegmentedControl
          options={[
            { value: "pending", label: "Apply" },
            { value: "history", label: "History" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load on-duty requests." : null}
        emptyMessage="No on-duty requests."
      />
    </div>
  );
}

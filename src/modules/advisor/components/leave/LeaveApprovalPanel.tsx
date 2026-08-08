"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useLeaves, useFacultyApproveLeave } from "../../hooks/useLeaves";
import type { LeaveStatus, StudentLeave } from "../../types";

const STATUS_TONE: Record<LeaveStatus, "amber" | "green" | "red" | "blue"> = {
  pending: "amber",
  faculty_approved: "blue",
  hod_approved: "green",
  rejected: "red",
};

export function LeaveApprovalPanel() {
  const { show } = useToast();
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const status = tab === "pending" ? "pending" : undefined;
  const { data, isLoading, error } = useLeaves({ status: status as LeaveStatus | undefined, limit: 50 });
  const approve = useFacultyApproveLeave();

  const rows = (data?.data ?? []).filter((l) => (tab === "pending" ? l.status === "pending" : l.status !== "pending"));

  function decide(id: number, decision: "approved" | "rejected") {
    approve
      .mutateAsync({ id, decision })
      .then(() => show(decision === "approved" ? "Leave approved." : "Leave rejected.", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  const columns: DataTableColumn<StudentLeave>[] = [
    { key: "student", header: "Student", render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.student.name}</p>
        <p className="text-xs text-slate-400">{row.student.student_id_no}</p>
      </div>
    ) },
    { key: "from_date", header: "From", render: (row) => new Date(row.from_date).toLocaleDateString() },
    { key: "to_date", header: "To", render: (row) => new Date(row.to_date).toLocaleDateString() },
    { key: "reason", header: "Reason", render: (row) => row.reason ?? "—" },
    ...(tab === "history"
      ? [{
          key: "status",
          header: "Status",
          render: (row: StudentLeave) => <StatusPill tone={STATUS_TONE[row.status]}>{row.status.replace("_", " ")}</StatusPill>,
        }]
      : []),
    ...(tab === "pending"
      ? [{
          key: "actions",
          header: "",
          align: "right" as const,
          render: (row: StudentLeave) => (
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
      <PageHeader title="Leave approval" description="Review leave requests from your mentee students." />

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
        error={error instanceof ApiError ? error.message : error ? "Failed to load leave requests." : null}
        emptyMessage="No leave requests."
      />
    </div>
  );
}

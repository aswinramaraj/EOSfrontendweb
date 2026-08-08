"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useNoDueStudents, useApproveNoDue, useRejectNoDue } from "../../hooks/useNoDue";
import type { NoDueStudent } from "../../types";

export function NoDuePanel() {
  const { show } = useToast();
  const [tab, setTab] = useState<"cleared" | "pending">("pending");
  const { data, isLoading, error } = useNoDueStudents({ status: tab, limit: 50 });
  const approve = useApproveNoDue();
  const reject = useRejectNoDue();

  function handleApprove(studentId: number) {
    approve
      .mutateAsync(studentId)
      .then(() => show("No-due override approved.", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  function handleReject(studentId: number) {
    reject
      .mutateAsync(studentId)
      .then(() => show("No-due override rejected.", "success"))
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  const columns: DataTableColumn<NoDueStudent>[] = [
    { key: "name", header: "Student", render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.name}</p>
        <p className="text-xs text-slate-400">{row.student_id_no}</p>
      </div>
    ) },
    { key: "section", header: "Section", render: (row) => row.section ?? "—" },
    {
      key: "fees",
      header: "Fees",
      render: (row) => (
        <StatusPill tone={row.fees.every((f) => f.cleared) ? "green" : "red"}>
          {row.fees.every((f) => f.cleared) ? "Paid" : "Pending"}
        </StatusPill>
      ),
    },
    {
      key: "library",
      header: "Library",
      render: (row) => <StatusPill tone={row.library.cleared ? "green" : "red"}>{row.library.cleared ? "No due" : "Pending"}</StatusPill>,
    },
    {
      key: "overall",
      header: "Overall",
      render: (row) =>
        tab === "pending" || row.total_pending > 0 ? (
          <StatusPill tone="amber">
            {row.total_pending > 0 ? `₹${row.total_pending} pending` : "Pending"}
          </StatusPill>
        ) : row.override_approved ? (
          <StatusPill tone="green">Approved</StatusPill>
        ) : (
          <StatusPill tone="green">No due</StatusPill>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => {
        const isFeesPending = !row.fees.every((f) => f.cleared) || row.total_pending > 0;
        const isApproving = approve.isPending && approve.variables === row.id;
        const isRejecting = reject.isPending && reject.variables === row.id;

        if (isFeesPending) {
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => handleApprove(row.id)}
                isPending={isApproving}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleReject(row.id)}
                isPending={isRejecting}
              >
                Reject
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-slate-400">Cleared</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader title="No-due requests" description="Clearance status for your mentee students." />

      <div className="mb-4">
        <SegmentedControl
          options={[
            { value: "pending", label: "Pending" },
            { value: "cleared", label: "Cleared" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load no-due status." : null}
        emptyMessage="No students found."
      />
    </div>
  );
}

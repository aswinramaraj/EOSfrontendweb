"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import { useHostels } from "@/modules/hostel/hooks/useHostels";
import { useHostelFees } from "@/modules/hostel/hooks/useHostelFees";
import { feeStatusLabel, feeStatusTone, formatCurrency } from "@/modules/hostel/lib/format";
import type { HostelFeeRow, HostelFeeStatus } from "@/modules/hostel/types/fees";

const PAGE_SIZE = 20;

export default function HostelFeesPage() {
  const [hostelId, setHostelId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<HostelFeeStatus | "">("");
  const [page, setPage] = useState(1);

  const { data: hostels } = useHostels();
  const { data, isLoading, error } = useHostelFees({
    hostel_id: hostelId,
    status: status || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const columns: DataTableColumn<HostelFeeRow>[] = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">
            {row.student_id_no}
            {row.room_number ? ` · ${row.room_number}` : ""}
          </p>
        </div>
      ),
    },
    { key: "sharing", header: "Sharing", render: (row) => row.sharing ?? "—" },
    { key: "total_amount", header: "Amount", align: "right", render: (row) => formatCurrency(row.total_amount) },
    { key: "paid_amount", header: "Paid", align: "right", render: (row) => formatCurrency(row.paid_amount) },
    { key: "balance", header: "Balance", align: "right", render: (row) => formatCurrency(row.balance) },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill tone={feeStatusTone(row.status)}>{feeStatusLabel(row.status)}</StatusPill>,
    },
  ];

  return (
    <div>
      <PageHeader title="Hostel fees" description="Dues and payment status by resident." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SelectInput
          className="w-auto"
          value={hostelId ?? ""}
          onChange={(e) => {
            setHostelId(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          <option value="">All blocks</option>
          {hostels?.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.code})
            </option>
          ))}
        </SelectInput>
        <SelectInput
          className="w-auto"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as HostelFeeStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="partially_paid">Partially paid</option>
          <option value="paid">Paid</option>
        </SelectInput>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.student_id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load fees." : null}
        emptyMessage="No hostel fee records found."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

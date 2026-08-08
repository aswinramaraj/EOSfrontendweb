"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useGateLog } from "@/modules/hostel/hooks/useGateLog";
import { GateLogEntryModal } from "@/modules/hostel/components/gate-log/GateLogEntryModal";
import type { GateEntryType, GateLogEntry } from "@/modules/hostel/types/gate-log";

const PAGE_SIZE = 20;
type Tab = "all" | GateEntryType;

export default function GateLogPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useGateLog({
    entry_type: tab === "all" ? undefined : tab,
    page,
    page_size: PAGE_SIZE,
  });

  const columns: DataTableColumn<GateLogEntry>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.student.name}</p>
          <p className="text-xs text-slate-500">{row.student.student_id_no}</p>
        </div>
      ),
    },
    { key: "hostel", header: "Block", render: (row) => row.hostel?.name ?? "—" },
    { key: "room_number", header: "Room", render: (row) => row.room_number ?? "—" },
    {
      key: "entry_type",
      header: "Movement",
      render: (row) => (
        <StatusPill tone={row.entry_type === "out" ? "amber" : "green"}>
          {row.entry_type === "out" ? "Check-out" : "Check-in"}
        </StatusPill>
      ),
    },
    { key: "recorded_at", header: "Recorded at", render: (row) => new Date(row.recorded_at).toLocaleString() },
    { key: "recorded_by", header: "Recorded by", render: (row) => row.recorded_by ?? "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Check-in / check-out"
        description="Gate register of hostel resident movements."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <PlusIcon className="h-4 w-4" /> Manual entry
          </Button>
        }
      />

      <div className="mb-4">
        <SegmentedControl<Tab>
          options={[
            { value: "all", label: "All" },
            { value: "out", label: "Check-out" },
            { value: "in", label: "Check-in" },
          ]}
          value={tab}
          onChange={(v) => {
            setTab(v);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load the gate log." : null}
        emptyMessage="No gate movements recorded."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <GateLogEntryModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

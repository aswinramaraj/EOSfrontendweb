"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { useComplaints, useUpdateComplaint } from "../../hooks/useComplaints";
import { useHostels } from "../../hooks/useHostels";
import { ComplaintFormModal } from "./ComplaintFormModal";
import { ComplaintUpdateModal } from "./ComplaintUpdateModal";
import {
  complaintArea,
  complaintAreaLabel,
  complaintTicketCode,
  daysSince,
  type ComplaintArea,
} from "../../lib/format";
import type { Complaint } from "../../types/complaints";

const PAGE_SIZE = 10;
const FETCH_SIZE = 100;

const AREA_FILTERS: Array<{ value: ComplaintArea | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "mess", label: "Mess" },
  { value: "hostel", label: "Hostel" },
  { value: "amenities", label: "Amenities" },
];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-blue-700 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export function ComplaintsPanel() {
  const [area, setArea] = useState<ComplaintArea | "all">("all");
  const [hostelId, setHostelId] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Complaint | null>(null);
  const { show } = useToast();

  const { data: hostels } = useHostels();
  const { data, isLoading, error } = useComplaints({
    hostel_id: hostelId === "all" ? undefined : hostelId,
    page: 1,
    page_size: FETCH_SIZE,
  });
  const updateComplaint = useUpdateComplaint();

  const filtered = useMemo(() => {
    const rows = data?.data ?? [];
    if (area === "all") return rows;
    return rows.filter((row) => complaintArea(row.category) === area);
  }, [data, area]);

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectArea(value: ComplaintArea | "all") {
    setArea(value);
    setPage(1);
  }

  function selectHostel(value: number | "all") {
    setHostelId(value);
    setPage(1);
  }

  function quickDecide(row: Complaint, status: "resolved" | "escalated") {
    updateComplaint.mutate(
      { id: row.id, input: { status } },
      {
        onSuccess: () => show(status === "resolved" ? "Ticket resolved." : "Ticket escalated.", "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  const columns: DataTableColumn<Complaint>[] = [
    {
      key: "title",
      header: "Ticket",
      render: (row) => (
        <button onClick={() => setEditTarget(row)} className="text-left hover:underline">
          <p className="font-medium text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-400">{complaintTicketCode(row.id)}</p>
        </button>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{complaintAreaLabel(complaintArea(row.category))}</p>
          <p className="text-xs capitalize text-slate-500">{row.category}</p>
        </div>
      ),
    },
    {
      key: "raised_by",
      header: "Raised by",
      render: (row) => (
        <p className="text-slate-700">
          {row.student.name}
          {row.room_number && <span className="text-slate-400"> · {row.room_number}</span>}
        </p>
      ),
    },
    {
      key: "block",
      header: "Block",
      render: (row) => row.hostel?.name ?? "—",
    },
    {
      key: "age",
      header: "Age",
      render: (row) => <span className="text-slate-600">{daysSince(row.created_at)}</span>,
    },
    {
      key: "action",
      header: "Action",
      render: (row) =>
        row.status === "resolved" || row.status === "escalated" ? (
          <span className="text-sm capitalize text-slate-400">{row.status}</span>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              isPending={updateComplaint.isPending}
              onClick={() => quickDecide(row, "resolved")}
            >
              Resolve
            </Button>
            <Button variant="ghost" size="sm" onClick={() => quickDecide(row, "escalated")}>
              Escalate
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Maintenance tickets raised by hostel residents."
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="h-4 w-4" /> New ticket
          </Button>
        }
      />

      <div className="mb-5 flex flex-nowrap items-center gap-3 overflow-x-auto">
        <div className="flex flex-nowrap items-center gap-2">
          {AREA_FILTERS.map((filter) => (
            <FilterPill key={filter.value} active={area === filter.value} onClick={() => selectArea(filter.value)}>
              {filter.label}
            </FilterPill>
          ))}
        </div>

        <div className="h-6 w-px shrink-0 bg-slate-200" />

        <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Block</p>
        <div className="flex flex-nowrap items-center gap-2">
          <FilterPill active={hostelId === "all"} onClick={() => selectHostel("all")}>
            All
          </FilterPill>
          {hostels?.map((hostel) => (
            <FilterPill key={hostel.id} active={hostelId === hostel.id} onClick={() => selectHostel(hostel.id)}>
              {hostel.name}
            </FilterPill>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-bold text-slate-900">
          Complaints and feedback <span className="font-normal text-slate-400">· {filtered.length} records</span>
        </h3>
        <DataTable
          columns={columns}
          rows={pageRows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          error={error instanceof ApiError ? error.message : error ? "Failed to load complaints." : null}
          emptyMessage="No complaints logged."
        />
        <PaginationBar page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      </div>

      <ComplaintFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <ComplaintUpdateModal complaint={editTarget} onClose={() => setEditTarget(null)} />
    </div>
  );
}

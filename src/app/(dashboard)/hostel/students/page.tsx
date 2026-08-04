"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useHostels } from "@/modules/hostel/hooks/useHostels";
import { useResidents } from "@/modules/hostel/hooks/useResidents";
import {
  currentStatusLabel,
  currentStatusTone,
  feeStatusLabel,
  feeStatusTone,
  formatDate,
} from "@/modules/hostel/lib/format";
import type { Resident } from "@/modules/hostel/types/residents";

const PAGE_SIZE = 20;

export default function StudentDetailsPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [hostelId, setHostelId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data: hostels } = useHostels();
  const { data, isLoading, error } = useResidents({
    q: debouncedQuery || undefined,
    hostel_id: hostelId,
    page,
    page_size: PAGE_SIZE,
  });

  const columns: DataTableColumn<Resident>[] = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">
            {row.student_id_no}
            {row.roll_no ? ` · ${row.roll_no}` : ""}
          </p>
        </div>
      ),
    },
    { key: "course_batch", header: "Course · year", render: (row) => `${row.course} · ${row.batch}` },
    { key: "hostel", header: "Block", render: (row) => row.hostel?.name ?? "—" },
    { key: "room", header: "Room", render: (row) => row.room?.room_number ?? "—" },
    { key: "sharing", header: "Sharing", render: (row) => row.sharing ?? "—" },
    {
      key: "guardian",
      header: "Guardian contact",
      render: (row) => (
        <div>
          <p>{row.guardian_name ?? "—"}</p>
          {row.guardian_phone && <p className="text-xs text-slate-500">{row.guardian_phone}</p>}
        </div>
      ),
    },
    {
      key: "fee_status",
      header: "Fees",
      render: (row) => <StatusPill tone={feeStatusTone(row.fee_status)}>{feeStatusLabel(row.fee_status)}</StatusPill>,
    },
    {
      key: "current_status",
      header: "Status",
      render: (row) => (
        <StatusPill tone={currentStatusTone(row.current_status)}>
          {currentStatusLabel(row.current_status)}
        </StatusPill>
      ),
    },
    { key: "allocated_date", header: "Since", render: (row) => formatDate(row.allocated_date) },
  ];

  return (
    <div>
      <PageHeader
        title="Student details"
        description="Block-wise resident register with room, guardian and fee state."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Search by name, roll or register number"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
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
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load residents." : null}
        emptyMessage="No hostel residents found."
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

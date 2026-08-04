"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { ApiError } from "@/shared/lib/api-client";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useMembers } from "@/modules/library/hooks/useMembers";
import { MemberNoDuesModal } from "@/modules/library/components/members/MemberNoDuesModal";
import { formatDate } from "@/modules/library/lib/borrow-record-format";
import type { LibraryMember } from "@/modules/library/types/members";

const PAGE_SIZE = 20;

export default function LibraryMembersPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState<LibraryMember | null>(null);

  const { data: departments } = useDepartments();
  const { data, isLoading, error } = useMembers({
    q: debouncedQuery || undefined,
    department_id: departmentId,
    page,
    page_size: PAGE_SIZE,
  });

  const columns: DataTableColumn<LibraryMember>[] = [
    {
      key: "name",
      header: "Student",
      render: (row) => (
        <button onClick={() => setDetailTarget(row)} className="text-left hover:underline">
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-500">{row.student_id_no}</p>
        </button>
      ),
    },
    { key: "department", header: "Department", render: (row) => row.department.name },
    { key: "currently_borrowed", header: "Currently borrowed" },
    { key: "total_borrowed", header: "Total borrowed" },
    {
      key: "last_borrowed",
      header: "Last borrowed",
      render: (row) =>
        row.last_borrowed ? `${row.last_borrowed.title} (${formatDate(row.last_borrowed.date)})` : "—",
    },
    {
      key: "library_status",
      header: "Status",
      render: (row) => (
        <StatusPill tone={row.library_status === "overdue" ? "amber" : "green"}>
          {row.library_status === "overdue" ? "Overdue" : "Clear"}
        </StatusPill>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Library members"
        description="Student members with a borrowing record — history, current borrowings and standing."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="max-w-sm flex-1">
          <SearchInput
            placeholder="Search by name, register or roll number"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <SelectInput
          className="w-auto"
          value={departmentId ?? ""}
          onChange={(e) => {
            setDepartmentId(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          <option value="">All departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </SelectInput>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load members." : null}
        emptyMessage="No library members found."
      />
      {data && (
        <PaginationBar
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={setPage}
        />
      )}

      <MemberNoDuesModal member={detailTarget} onClose={() => setDetailTarget(null)} />
    </div>
  );
}

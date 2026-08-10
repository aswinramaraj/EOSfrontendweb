"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ApiError } from "@/shared/lib/api-client";
import { GridIcon, ListIcon, PersonPlusIcon } from "@/shared/components/icons";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { FacultyDirectoryCard } from "@/modules/hr/components/FacultyDirectoryCard";
import type { Faculty } from "@/modules/faculty/types";

const ALL = "all";

export default function HRFacultyDirectoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [view, setView] = useState<"grid" | "list">("grid");

  const { data: departments } = useDepartments();

  const { data, isLoading, error } = useFaculties({
    search: search || undefined,
    department_id: departmentId !== ALL ? Number(departmentId) : undefined,
    status: status !== ALL ? (status as "active" | "inactive") : undefined,
    limit: 50,
  });

  const faculty = data?.data ?? [];

  function resetFilters() {
    setSearch("");
    setDepartmentId(ALL);
    setStatus(ALL);
  }

  function openProfile(member: Faculty) {
    router.push(`/hr/faculty-directory/${member.id}`);
  }

  return (
    <div>
      <PageHeader
        title="Faculty Directory"
        description="Sri Eshwar College faculty roster — search, filter, and view detailed profiles."
        actions={
          <Link
            href="/hr/faculty-directory/new"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            <PersonPlusIcon className="h-4 w-4" />
            Add Faculty
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <SelectInput className="sm:w-44" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value={ALL}>All Departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.name}
            </option>
          ))}
        </SelectInput>

        <SelectInput className="sm:w-32" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value={ALL}>All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </SelectInput>

        <button
          onClick={resetFilters}
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load faculty."}
        </p>
      )}

      {!error && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {isLoading ? "Loading…" : `Showing ${faculty.length} of ${data?.meta.total ?? 0} faculty`}
          </p>
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`rounded-[4px] p-1.5 ${view === "grid" ? "bg-blue-700 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`rounded-[4px] p-1.5 ${view === "list" ? "bg-blue-700 text-white" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {!error && view === "grid" && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {faculty.map((member) => (
            <FacultyDirectoryCard key={member.id} faculty={member} onOpenProfile={openProfile} />
          ))}
          {!isLoading && faculty.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-slate-500">No faculty match these filters.</p>
          )}
        </div>
      )}

      {!error && view === "list" && (
        <DataTable<Faculty>
          columns={[
            { key: "id", header: "ID" },
            {
              key: "name",
              header: "Name",
              render: (row) => fullName(row),
            },
            { key: "designation", header: "Designation" },
            { key: "department", header: "Department", render: (row) => row.department?.name ?? "—" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <StatusPill tone={row.status === "active" ? "green" : "slate"}>
                  {row.status === "active" ? "Active" : "Inactive"}
                </StatusPill>
              ),
            },
          ]}
          rows={faculty}
          rowKey={(row) => row.id}
          onRowClick={openProfile}
          isLoading={isLoading}
          emptyMessage="No faculty match these filters."
        />
      )}
    </div>
  );
}

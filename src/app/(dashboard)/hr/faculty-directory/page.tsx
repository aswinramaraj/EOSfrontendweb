"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { DataTable } from "@/shared/components/ui/DataTable";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { GridIcon, ListIcon, PersonPlusIcon } from "@/shared/components/icons";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { FacultyDirectoryCard } from "@/modules/hr/components/FacultyDirectoryCard";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRFilterBar } from "@/modules/hr/components/ui/HRFilterBar";
import { HRDirectoryCardsSkeleton } from "@/modules/hr/components/ui/HRSkeleton";
import type { Faculty } from "@/modules/faculty/types";

const ALL = "all";

export default function HRFacultyDirectoryPage() {
  return (
    <Suspense fallback={null}>
      <HRFacultyDirectoryPageContent />
    </Suspense>
  );
}

function HRFacultyDirectoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The topbar's global search lands here with ?q=… when a search is
  // submitted without picking a result from its dropdown.
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
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
      <HRPageHeader
        title="Faculty Directory"
        description={`${data?.meta.total ?? 0} staff on roll — search, filter and open detailed personnel records.`}
        actions={
          <Link href="/hr/faculty-directory/new">
            <Button variant="primary">
              <PersonPlusIcon className="h-4 w-4" />
              Add Faculty
            </Button>
          </Link>
        }
      />

      <HRFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, employee ID or email…"
        onReset={resetFilters}
        resultCount={{ showing: faculty.length, total: data?.meta.total ?? 0, noun: "employees" }}
        filters={
          <>
            <SelectInput className="w-auto" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value={ALL}>All Departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </SelectInput>
            <SelectInput className="w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value={ALL}>All Designations</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectInput>
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
          </>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load faculty."}
        </p>
      )}

      {!error && view === "grid" && isLoading && <HRDirectoryCardsSkeleton count={8} />}

      {!error && view === "grid" && !isLoading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {faculty.map((member) => (
            <FacultyDirectoryCard key={member.id} faculty={member} onOpenProfile={openProfile} />
          ))}
          {faculty.length === 0 && (
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

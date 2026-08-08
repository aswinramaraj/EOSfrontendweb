"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SegmentedControl } from "@/shared/components/ui/SegmentedControl";
import { PaginationBar } from "@/shared/components/ui/PaginationBar";
import { ApiError } from "@/shared/lib/api-client";
import { useStudentOds } from "@/modules/iqac/hooks/useStudentOds";
import { useFacultyOds } from "@/modules/iqac/hooks/useFacultyOds";
import { OdFilters, type OdFilterValue } from "@/modules/iqac/components/od/OdFilters";
import { StudentOdCard } from "@/modules/iqac/components/od/StudentOdCard";
import { FacultyOdCard } from "@/modules/iqac/components/od/FacultyOdCard";

type Tab = "student" | "faculty";
const PAGE_SIZE = 10;

export default function OdDetailsPage() {
  const [tab, setTab] = useState<Tab>("student");
  const [filters, setFilters] = useState<OdFilterValue>({});
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const studentQuery = useStudentOds({ ...filters, page, limit: PAGE_SIZE });
  const facultyQuery = useFacultyOds({ ...filters, page, limit: PAGE_SIZE });

  const activeQuery = tab === "student" ? studentQuery : facultyQuery;
  const { data, isLoading, error } = activeQuery;
  const rows = data?.data ?? [];

  function switchTab(next: Tab) {
    setTab(next);
    setPage(1);
    setExpandedId(null);
  }

  function changeFilters(next: OdFilterValue) {
    setFilters(next);
    setPage(1);
  }

  function toggle(id: number) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div>
      <PageHeader title="OD Details" description="Student and faculty on-duty requests, with document verification." />

      <div className="mb-5">
        <SegmentedControl
          options={[
            { value: "student", label: "Student" },
            { value: "faculty", label: "Faculty" },
          ]}
          value={tab}
          onChange={switchTab}
        />
      </div>

      <OdFilters value={filters} onChange={changeFilters} />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load on-duty records."}
        </p>
      )}

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {!isLoading && rows.length === 0 && !error && (
        <div className="rounded-lg border border-slate-200 bg-white py-16 text-center">
          <p className="text-lg font-bold text-slate-900">No Records Found</p>
          <p className="mt-1 text-sm text-slate-500">
            No on-duty activity has been recorded for the selected filters.
          </p>
        </div>
      )}

      {!isLoading &&
        tab === "student" &&
        studentQuery.data?.data.map((item) => (
          <StudentOdCard key={item.id} item={item} open={expandedId === item.id} onToggle={() => toggle(item.id)} />
        ))}

      {!isLoading &&
        tab === "faculty" &&
        facultyQuery.data?.data.map((item) => (
          <FacultyOdCard key={item.id} item={item} open={expandedId === item.id} onToggle={() => toggle(item.id)} />
        ))}

      {data && (
        <PaginationBar page={data.meta.page} pageSize={data.meta.limit} total={data.meta.total} onPageChange={setPage} />
      )}
    </div>
  );
}

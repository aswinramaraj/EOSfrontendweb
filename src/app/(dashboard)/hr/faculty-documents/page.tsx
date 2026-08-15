"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { ApiError } from "@/shared/lib/api-client";
import { ChevronRightIcon, FileTextIcon } from "@/shared/components/icons";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import type { Faculty } from "@/modules/faculty/types";

interface DepartmentGroup {
  name: string;
  members: Faculty[];
}

export default function HRFacultyDocumentsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useFaculties({ search: search || undefined, limit: 100 });

  const groups = useMemo(() => {
    const byDept = new Map<number, DepartmentGroup>();
    for (const member of data?.data ?? []) {
      const deptId = member.department?.id ?? 0;
      const deptName = member.department?.name ?? "Unassigned";
      if (!byDept.has(deptId)) byDept.set(deptId, { name: deptName, members: [] });
      byDept.get(deptId)!.members.push(member);
    }
    return Array.from(byDept.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Browse faculty by department to view and download their uploaded documents."
      />

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
        <SearchInput
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load faculty."}
        </p>
      )}

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {!isLoading && !error && groups.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-500">No faculty match this search.</p>
      )}

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.name} className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">{group.name}</h3>
              <span className="text-xs font-medium text-slate-500">
                {group.members.length} faculty
              </span>
            </div>
            {group.members.map((member) => (
              <Link
                key={member.id}
                href={`/hr/faculty-directory/${member.id}?tab=documents`}
                className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 last:border-b-0 hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <FileTextIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{fullName(member)}</p>
                  <p className="text-xs text-slate-500">
                    {member.designation} · ID {member.id}
                  </p>
                </div>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

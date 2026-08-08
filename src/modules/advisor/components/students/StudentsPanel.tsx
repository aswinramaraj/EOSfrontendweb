"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { EyeIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useMenteeClasses, useClassResult } from "../../hooks/useStudents";
import { NoMenteeClasses } from "../NoMenteeClasses";
import { StudentProfileModal } from "./StudentProfileModal";
import type { MenteeClassResultStudent } from "../../types";

export function StudentsPanel() {
  const { data: menteeClasses, isLoading: classesLoading } = useMenteeClasses();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [profileTarget, setProfileTarget] = useState<number | null>(null);

  const activeClassId = classId ?? menteeClasses?.[0]?.class_id;
  const { data: result, isLoading, error } = useClassResult(activeClassId);

  const rows = useMemo(() => {
    const students = result?.students ?? [];
    if (!debouncedSearch) return students;
    const q = debouncedSearch.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.student_id_no.toLowerCase().includes(q),
    );
  }, [result, debouncedSearch]);

  if (classesLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!menteeClasses || menteeClasses.length === 0) {
    return (
      <div>
        <PageHeader title="My students" />
        <NoMenteeClasses />
      </div>
    );
  }

  const columns: DataTableColumn<MenteeClassResultStudent>[] = [
    { key: "name", header: "Student", render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.name}</p>
        <p className="text-xs text-slate-400">{row.student_id_no}</p>
      </div>
    ) },
    { key: "roll_no", header: "Roll no." },
    {
      key: "attendance",
      header: "Attendance",
      render: (row) =>
        row.attendance_percent === null ? (
          "—"
        ) : (
          <StatusPill tone={row.attendance_percent < 75 ? "red" : "green"}>
            {row.attendance_percent}%
          </StatusPill>
        ),
    },
    { key: "cgpa", header: "CGPA", render: (row) => row.cgpa ?? "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <button
          onClick={() => setProfileTarget(row.id)}
          className="text-slate-400 hover:text-blue-700"
          aria-label="View profile"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="My students" description={result ? `${result.class.label} — ${result.department.name}` : undefined} />

      <div className="mb-4 flex flex-wrap gap-3">
        {menteeClasses.length > 1 && (
          <SelectInput
            className="w-auto"
            value={activeClassId}
            onChange={(e) => setClassId(Number(e.target.value))}
          >
            {menteeClasses.map((c, index) => (
              <option key={`${c.class_id}-${c.academic_year ?? index}`} value={c.class_id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        )}
        <SearchInput
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load students." : null}
        emptyMessage="No students found."
      />

      <StudentProfileModal
        studentId={profileTarget}
        onClose={() => setProfileTarget(null)}
      />
    </div>
  );
}

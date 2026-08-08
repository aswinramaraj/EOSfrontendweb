"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { Button } from "@/shared/components/ui/Button";
import { DownloadIcon, EyeIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useMenteeClasses, useClassResult } from "../../hooks/useStudents";
import { NoMenteeClasses } from "../NoMenteeClasses";
import { downloadCsv } from "../../lib/csv-export";
import { StudentProfileModal } from "../students/StudentProfileModal";
import type { MenteeClassResultStudent } from "../../types";

export function RecordsPanel() {
  const { data: menteeClasses, isLoading: classesLoading } = useMenteeClasses();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const activeClassId = classId ?? menteeClasses?.[0]?.class_id;
  const { data: result, isLoading, error } = useClassResult(activeClassId);
  const [profileTarget, setProfileTarget] = useState<number | null>(null);

  if (classesLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!menteeClasses || menteeClasses.length === 0) {
    return (
      <div>
        <PageHeader title="Student records" />
        <NoMenteeClasses />
      </div>
    );
  }

  const students = result?.students ?? [];

  const columns: DataTableColumn<MenteeClassResultStudent>[] = [
    { key: "roll_no", header: "Roll no." },
    { key: "name", header: "Student" },
    { key: "attendance", header: "Attendance %", render: (r) => r.attendance_percent ?? "—" },
    { key: "cgpa", header: "CGPA", render: (r) => r.cgpa ?? "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <button onClick={() => setProfileTarget(row.id)} className="text-slate-400 hover:text-blue-700" aria-label="Open record">
          <EyeIcon className="h-4 w-4" />
        </button>
      ),
    },
  ];

  function handleExport() {
    downloadCsv(
      "student-records.csv",
      ["Roll No", "Student", "Attendance %", "CGPA", "Arrears"],
      students.map((s) => [s.roll_no ?? "", s.name, s.attendance_percent ?? "", s.cgpa ?? "", s.arrears]),
    );
  }

  return (
    <div>
      <PageHeader
        title="Student records"
        description="Read-only summary of your mentee class."
        actions={
          <Button variant="secondary" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4" /> Export records
          </Button>
        }
      />

      {menteeClasses.length > 1 && (
        <div className="mb-4">
          <SelectInput className="w-auto" value={activeClassId} onChange={(e) => setClassId(Number(e.target.value))}>
            {menteeClasses.map((c, index) => (
              <option key={`${c.class_id}-${c.academic_year ?? index}`} value={c.class_id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={students}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load records." : null}
        emptyMessage="No records found."
      />

      <StudentProfileModal studentId={profileTarget} onClose={() => setProfileTarget(null)} />
    </div>
  );
}

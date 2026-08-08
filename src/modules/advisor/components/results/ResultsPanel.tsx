"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatCard } from "@/shared/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { ApiError } from "@/shared/lib/api-client";
import { useMenteeClasses, useClassResult } from "../../hooks/useStudents";
import { NoMenteeClasses } from "../NoMenteeClasses";
import type { MenteeClassResultStudent } from "../../types";

export function ResultsPanel() {
  const { data: menteeClasses, isLoading: classesLoading } = useMenteeClasses();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const activeClassId = classId ?? menteeClasses?.[0]?.class_id;
  const { data: result, isLoading, error } = useClassResult(activeClassId);

  const stats = useMemo(() => {
    const students = result?.students ?? [];
    const withCgpa = students.filter((s) => s.cgpa !== null);
    const avgCgpa = withCgpa.length
      ? withCgpa.reduce((sum, s) => sum + (s.cgpa ?? 0), 0) / withCgpa.length
      : null;
    const arrearsCount = students.filter((s) => s.arrears > 0).length;
    const topper = [...withCgpa].sort((a, b) => (b.cgpa ?? 0) - (a.cgpa ?? 0))[0] ?? null;
    return { avgCgpa, arrearsCount, topper, total: students.length };
  }, [result]);

  if (classesLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!menteeClasses || menteeClasses.length === 0) {
    return (
      <div>
        <PageHeader title="Class results" />
        <NoMenteeClasses />
      </div>
    );
  }

  const columns: DataTableColumn<MenteeClassResultStudent>[] = [
    { key: "rank", header: "#", render: (row) => {
      const students = result?.students ?? [];
      const sorted = [...students].sort((a, b) => (b.cgpa ?? 0) - (a.cgpa ?? 0));
      return sorted.findIndex((s) => s.id === row.id) + 1;
    } },
    { key: "name", header: "Student", render: (row) => (
      <div>
        <p className="font-medium text-slate-900">{row.name}</p>
        <p className="text-xs text-slate-400">{row.student_id_no}</p>
      </div>
    ) },
    { key: "roll_no", header: "Roll no." },
    { key: "cgpa", header: "CGPA", render: (row) => row.cgpa ?? "—" },
    {
      key: "arrears",
      header: "Arrears",
      render: (row) => (row.arrears > 0 ? <StatusPill tone="red">{row.arrears} arrear(s)</StatusPill> : <StatusPill tone="green">None</StatusPill>),
    },
  ];

  const sortedRows = [...(result?.students ?? [])].sort((a, b) => (b.cgpa ?? 0) - (a.cgpa ?? 0));

  return (
    <div>
      <PageHeader title="Class results" description={result ? `${result.class.label} — derived from recorded exam marks` : undefined} />

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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Class average CGPA" value={stats.avgCgpa !== null ? stats.avgCgpa.toFixed(2) : "—"} />
        <StatCard label="Students with arrears" value={stats.arrearsCount} />
        <StatCard label="Topper" value={stats.topper ? `${stats.topper.name} (${stats.topper.cgpa})` : "—"} />
      </div>

      <DataTable
        columns={columns}
        rows={sortedRows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load results." : null}
        emptyMessage="No results found."
      />
    </div>
  );
}

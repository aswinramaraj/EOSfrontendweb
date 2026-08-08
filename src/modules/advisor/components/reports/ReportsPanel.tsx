"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { DownloadIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useMenteeClasses, useClassResult } from "../../hooks/useStudents";
import { NoMenteeClasses } from "../NoMenteeClasses";
import { downloadCsv } from "../../lib/csv-export";
import type { MenteeClassResultStudent } from "../../types";

type ReportType = "attendance" | "performance" | "arrears";

const REPORT_OPTIONS: { value: ReportType; label: string }[] = [
  { value: "attendance", label: "Attendance report" },
  { value: "performance", label: "Semester performance report" },
  { value: "arrears", label: "Standing arrears report" },
];

export function ReportsPanel() {
  const { data: menteeClasses, isLoading: classesLoading } = useMenteeClasses();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const activeClassId = classId ?? menteeClasses?.[0]?.class_id;
  const { data: result, isLoading, error } = useClassResult(activeClassId);
  const [reportType, setReportType] = useState<ReportType>("attendance");

  if (classesLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!menteeClasses || menteeClasses.length === 0) {
    return (
      <div>
        <PageHeader title="Reports" />
        <NoMenteeClasses />
      </div>
    );
  }

  const students = result?.students ?? [];

  const columnsByReport: Record<ReportType, DataTableColumn<MenteeClassResultStudent>[]> = {
    attendance: [
      { key: "roll_no", header: "Roll no." },
      { key: "name", header: "Student" },
      { key: "attendance", header: "Attendance %", render: (r) => r.attendance_percent ?? "—" },
    ],
    performance: [
      { key: "roll_no", header: "Roll no." },
      { key: "name", header: "Student" },
      { key: "attendance", header: "Attendance %", render: (r) => r.attendance_percent ?? "—" },
      { key: "cgpa", header: "CGPA", render: (r) => r.cgpa ?? "—" },
      { key: "arrears", header: "Arrears" },
    ],
    arrears: [
      { key: "roll_no", header: "Roll no." },
      { key: "name", header: "Student" },
      { key: "arrears", header: "Arrears" },
    ],
  };

  const rowsByReport: Record<ReportType, MenteeClassResultStudent[]> = {
    attendance: students,
    performance: students,
    arrears: students.filter((s) => s.arrears > 0),
  };

  function handleExport() {
    const rows = rowsByReport[reportType];
    if (reportType === "attendance") {
      downloadCsv("attendance-report.csv", ["Roll No", "Student", "Attendance %"], rows.map((r) => [r.roll_no ?? "", r.name, r.attendance_percent ?? ""]));
    } else if (reportType === "performance") {
      downloadCsv(
        "performance-report.csv",
        ["Roll No", "Student", "Attendance %", "CGPA", "Arrears"],
        rows.map((r) => [r.roll_no ?? "", r.name, r.attendance_percent ?? "", r.cgpa ?? "", r.arrears]),
      );
    } else {
      downloadCsv("arrears-report.csv", ["Roll No", "Student", "Arrears"], rows.map((r) => [r.roll_no ?? "", r.name, r.arrears]));
    }
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Reports are generated from live attendance and exam-mark data."
        actions={
          <Button variant="secondary" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4" /> Download CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        {menteeClasses.length > 1 && (
          <SelectInput className="w-auto" value={activeClassId} onChange={(e) => setClassId(Number(e.target.value))}>
            {menteeClasses.map((c, index) => (
              <option key={`${c.class_id}-${c.academic_year ?? index}`} value={c.class_id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        )}
        <SelectInput className="w-auto" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
          {REPORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectInput>
      </div>

      <DataTable
        columns={columnsByReport[reportType]}
        rows={rowsByReport[reportType]}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load report data." : null}
        emptyMessage="No data for this report."
      />
    </div>
  );
}

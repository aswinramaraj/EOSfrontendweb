"use client";

import { useRef, useState } from "react";
import { useExamBoard, useExamMarksEntry } from "../hooks/academics.hooks";
import type { AcademicsMappingOption, ExamMarkRecord, FacultyExamBoardRow } from "../types/academics.types";
import { DashboardSectionState } from "../../dashboard/components/DashboardSectionState";
import { StudentRosterUnavailableNotice } from "../../dashboard/components/StudentRosterUnavailableNotice";

interface StatCardProps {
  label: string;
  value: string;
  accent?: string;
}

function StatCard({ label, value, accent = "text-slate-900" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Naive CSV parser (no quoted-comma handling) — adequate for the
 * roll-no/name/marks columns this import is meant for. */
function parseCsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .map((line) => line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")));
}

function ExamMarkCorrectionRow({
  record,
  onSave,
}: {
  record: ExamMarkRecord;
  onSave: (recordId: number, value: number) => Promise<boolean>;
}) {
  const [value, setValue] = useState(record.marks_obtained);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const num = Number(value);
    if (!Number.isFinite(num)) return;
    setIsSaving(true);
    await onSave(record.id, num);
    setIsSaving(false);
  }

  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3 text-sm text-slate-500">{record.student.student_id_no}</td>
      <td className="px-4 py-3 text-sm font-medium text-slate-800">{record.student.name}</td>
      <td className="px-4 py-3 text-sm text-slate-500">{record.max_marks}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={Number(record.max_marks)}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="button"
            disabled={isSaving || Number(value) === Number(record.marks_obtained)}
            onClick={handleSave}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </td>
    </tr>
  );
}

function ExamMarksPanel({
  row,
  examOptions,
  onSelectRow,
}: {
  row: FacultyExamBoardRow;
  examOptions: FacultyExamBoardRow[];
  onSelectRow: (examSubjectMappingId: number) => void;
}) {
  const {
    status,
    validation,
    roster,
    rosterAvailable,
    existingRecords,
    maxMarksInput,
    setMaxMarksInput,
    marksInputs,
    setMarkInput,
    canSubmitEntry,
    isSubmitting,
    submitEntry,
    correctMark,
    submitError,
    error,
    retry,
  } = useExamMarksEntry(row);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocked = Boolean(validation && validation.entered > 0);

  const enteredScores = isLocked
    ? existingRecords.map((record) => Number(record.marks_obtained))
    : roster
        .map((student) => marksInputs[student.id])
        .filter((raw): raw is string => raw !== undefined && raw.trim() !== "")
        .map(Number)
        .filter(Number.isFinite);

  const highest = enteredScores.length > 0 ? Math.max(...enteredScores) : null;
  const lowest = enteredScores.length > 0 ? Math.min(...enteredScores) : null;
  const average = enteredScores.length > 0 ? enteredScores.reduce((a, b) => a + b, 0) / enteredScores.length : null;
  const displayMaxMarks = isLocked ? (existingRecords[0]?.max_marks ?? "—") : maxMarksInput.trim() || "—";

  function handleExport() {
    const rows: (string | number)[][] = [["Roll No", "Student Name", "Max Marks", "Marks Obtained"]];
    if (isLocked) {
      existingRecords.forEach((record) => rows.push([record.student.student_id_no, record.student.name, record.max_marks, record.marks_obtained]));
    } else {
      roster.forEach((student) =>
        rows.push([
          student.registerNo ?? student.studentIdNo,
          [student.firstName, student.lastName].filter(Boolean).join(" ") || student.studentIdNo,
          maxMarksInput || "",
          marksInputs[student.id] ?? "",
        ]),
      );
    }
    downloadCsv(`${row.examTypeName}-${row.subjectCode}-marks.csv`, rows);
  }

  function handleImportFile(file: File) {
    file.text().then((text) => {
      const parsedRows = parseCsv(text);
      const dataRows = parsedRows[0]?.[0]?.toLowerCase().includes("roll") ? parsedRows.slice(1) : parsedRows;
      const byRollOrId = new Map(roster.map((student) => [student.registerNo ?? student.studentIdNo, student]));

      for (const cols of dataRows) {
        const [rollNo, , , marksObtained] = cols;
        const student = byRollOrId.get(rollNo);
        if (student && marksObtained !== undefined && marksObtained.trim() !== "") {
          setMarkInput(student.id, marksObtained.trim());
        }
      }
    });
  }

  /** Real, working report generation with no backend support to lean on:
   * builds a printable HTML summary from the data already on screen and
   * hands it to the browser's print dialog (Save as PDF works there),
   * rather than faking a "report" endpoint that doesn't exist. */
  function handleGenerateReport() {
    const tableRows = isLocked
      ? existingRecords.map((record) => [record.student.student_id_no, record.student.name, record.max_marks, record.marks_obtained])
      : roster.map((student) => [
          student.registerNo ?? student.studentIdNo,
          [student.firstName, student.lastName].filter(Boolean).join(" ") || student.studentIdNo,
          displayMaxMarks,
          marksInputs[student.id] ?? "—",
        ]);

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    reportWindow.document.write(`<!doctype html>
<html>
<head>
<title>${row.examTypeName} Marks Report — ${row.subjectCode}</title>
<style>
  body { font-family: -apple-system, Segoe UI, sans-serif; padding: 32px; color: #1e293b; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.meta { color: #64748b; font-size: 13px; margin: 0 0 20px; }
  .stats { display: flex; gap: 32px; margin-bottom: 24px; }
  .stat p { margin: 0; color: #64748b; font-size: 12px; }
  .stat b { display: block; font-size: 18px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
  th { color: #64748b; text-transform: uppercase; font-size: 11px; }
</style>
</head>
<body>
  <h1>${row.examTypeName} — ${row.subjectName} (${row.subjectCode})</h1>
  <p class="meta">${row.classSection} &middot; AY ${row.academicYear} &middot; Semester ${row.semester}</p>
  <div class="stats">
    <div class="stat"><p>Highest Score</p><b>${highest === null ? "—" : `${highest} / ${displayMaxMarks}`}</b></div>
    <div class="stat"><p>Lowest Score</p><b>${lowest === null ? "—" : `${lowest} / ${displayMaxMarks}`}</b></div>
    <div class="stat"><p>Average Score</p><b>${average === null ? "—" : `${average.toFixed(1)} / ${displayMaxMarks}`}</b></div>
    <div class="stat"><p>Entry Progress</p><b>${validation ? `${validation.entered} / ${validation.total_students}` : "—"}</b></div>
  </div>
  <table>
    <thead><tr><th>Roll No</th><th>Student Name</th><th>Max Marks</th><th>Marks Obtained</th></tr></thead>
    <tbody>${tableRows.map((cols) => `<tr>${cols.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
  </table>
</body>
</html>`);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <label className="block max-w-xs">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Exam Type</span>
            <select
              value={row.examSubjectMappingId}
              onChange={(e) => onSelectRow(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            >
              {examOptions.map((option) => (
                <option key={option.examSubjectMappingId} value={option.examSubjectMappingId}>
                  {option.examTypeName}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = "";
              }}
            />
            {!isLocked && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Import Excel
              </button>
            )}
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Export Excel
            </button>
            <button
              type="button"
              onClick={handleGenerateReport}
              className="rounded-lg bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              Generate Report
            </button>
            {isLocked ? (
              <span className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">🔒 Locked &amp; Published</span>
            ) : (
              <button
                type="button"
                disabled={!canSubmitEntry}
                onClick={submitEntry}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-200"
              >
                {isSubmitting ? "Submitting…" : "Lock & Publish CIA Marks"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Highest Score" value={highest === null ? "—" : `${highest} / ${displayMaxMarks}`} accent="text-indigo-600" />
        <StatCard label="Lowest Score" value={lowest === null ? "—" : `${lowest} / ${displayMaxMarks}`} />
        <StatCard label="Average Score" value={average === null ? "—" : `${average.toFixed(1)} / ${displayMaxMarks}`} />
        <StatCard
          label="Entry Progress"
          value={validation ? `${validation.entered} / ${validation.total_students} entered` : "—"}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-bold text-slate-900">
            {row.examTypeName} Marks — {row.classSection}
          </p>
        </div>

        <DashboardSectionState status={status} error={error} onRetry={retry} skeletonRows={5}>
          {!isLocked && !rosterAvailable ? (
            <div className="p-5">
              <StudentRosterUnavailableNotice />
            </div>
          ) : isLocked && existingRecords.length === 0 ? (
            // Marks exist for this exam (validation.entered > 0) but none were
            // entered by this faculty account — GET /me/exam-marks only ever
            // returns the calling faculty's own rows, so there is nothing here
            // to display or correct even though the mapping is locked overall.
            <div className="p-5">
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-600">Marks for this exam were entered by another faculty account.</p>
                <p className="max-w-sm text-xs text-slate-400">
                  This exam is already locked, but only the faculty who entered the marks can view or correct them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {!isLocked && (
                <div className="border-b border-slate-100 px-5 py-4">
                  <label className="block max-w-40">
                    <span className="text-xs font-semibold text-slate-500">Max Marks</span>
                    <input
                      type="number"
                      min={1}
                      value={maxMarksInput}
                      onChange={(e) => setMaxMarksInput(e.target.value)}
                      placeholder="e.g. 20"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />
                  </label>
                </div>
              )}

              <table className="w-full min-w-150 text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Roll No</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Max Marks</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {isLocked
                    ? existingRecords.map((record) => (
                        <ExamMarkCorrectionRow key={record.id} record={record} onSave={correctMark} />
                      ))
                    : roster.map((student) => (
                        <tr key={student.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-4 py-3 text-sm text-slate-500">{student.registerNo ?? student.studentIdNo}</td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-800">
                            {[student.firstName, student.lastName].filter(Boolean).join(" ") || student.studentIdNo}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500">{displayMaxMarks}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              value={marksInputs[student.id] ?? ""}
                              onChange={(e) => setMarkInput(student.id, e.target.value)}
                              placeholder="—"
                              className="w-24 rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            />
                          </td>
                        </tr>
                      ))}
                  {!isLocked && roster.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">
                        No students are enrolled in this class.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {!isLocked && submitError && <p className="px-5 py-3 text-xs font-medium text-red-600">{submitError}</p>}
            </div>
          )}
        </DashboardSectionState>
      </div>
    </div>
  );
}

interface CaMarksTabProps {
  mappingOptions: AcademicsMappingOption[];
  identityStatus: "loading" | "error" | "empty" | "ready";
  selectedOption: AcademicsMappingOption | null;
}

export function CaMarksTab({ mappingOptions, identityStatus, selectedOption }: CaMarksTabProps) {
  const { status, rows, error, retry } = useExamBoard(mappingOptions, identityStatus);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  const filtered = selectedOption
    ? rows.filter((row) => row.classId === selectedOption.classId && row.subjectId === selectedOption.subjectId)
    : rows;
  const selectedRow = filtered.find((row) => row.examSubjectMappingId === selectedRowId) ?? filtered[0] ?? null;

  if (!selectedOption) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
        Select a class &amp; subject above to view CIA marks entry.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-slate-900">
        CIA Marks Entry — {selectedOption.departmentCode} {selectedOption.classSection}
      </h2>

      <DashboardSectionState
        status={status}
        error={error}
        onRetry={retry}
        emptyMessage="No exams have been scheduled yet for your subjects."
        skeletonRows={3}
      >
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
            No exams scheduled yet for this class &amp; subject.
          </div>
        ) : (
          selectedRow && (
            <ExamMarksPanel
              key={selectedRow.examSubjectMappingId}
              row={selectedRow}
              examOptions={filtered}
              onSelectRow={setSelectedRowId}
            />
          )
        )}
      </DashboardSectionState>
    </div>
  );
}

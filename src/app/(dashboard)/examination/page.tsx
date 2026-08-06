"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { StatCard } from "@/shared/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { CalendarIcon, GraduationCapIcon, PeopleIcon, RefreshIcon } from "@/shared/components/icons";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { useResultsSummary, usePassRateByDepartment } from "@/modules/examination/hooks/useResults";
import { useRevaluationRequests } from "@/modules/examination/hooks/useRevaluationRequests";
import { useExamReportPreview } from "@/modules/examination/hooks/useExamReportPreview";
import type { ExamStatus } from "@/modules/examination/types/exams";

const STATUS_STEPS: { key: ExamStatus; label: string }[] = [
  { key: "created", label: "Created" },
  { key: "timetable_published", label: "Timetable published" },
  { key: "completed", label: "Examinations completed" },
  { key: "results_published", label: "Results published" },
];

interface ScheduleRow {
  date: string;
  session: string;
  subject: string;
  subject_code: string;
  class_section: string;
  venue: string;
  start_time: string;
  end_time: string;
}

export default function ExaminationDashboardPage() {
  const { data: sortedExams, isLoading: examsLoading } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  const currentExam = useMemo(() => {
    if (selectedExamId !== null) return sortedExams.find((e) => e.id === selectedExamId) ?? null;
    return sortedExams[0] ?? null;
  }, [sortedExams, selectedExamId]);

  const { data: summary } = useResultsSummary(currentExam?.id);
  const { data: passRates } = usePassRateByDepartment(currentExam?.id);
  const { data: revaluationRequests } = useRevaluationRequests();
  const { data: scheduleReport } = useExamReportPreview("examination-schedule", currentExam?.id);

  const today = new Date().toISOString().slice(0, 10);
  const scheduleRows = (scheduleReport?.rows ?? []) as unknown as ScheduleRow[];
  const todaysSessions = scheduleRows.filter((row) => row.date === today);

  const examRevaluationCount = currentExam
    ? (revaluationRequests ?? []).filter((r) => r.exam_id === currentExam.id).length
    : 0;
  const pendingRevaluationCount = currentExam
    ? (revaluationRequests ?? []).filter(
        (r) => r.exam_id === currentExam.id && ["requested", "under_review"].includes(r.status),
      ).length
    : 0;

  const currentStepIndex = currentExam
    ? STATUS_STEPS.findIndex((s) => s.key === currentExam.status)
    : -1;

  const scheduleColumns: DataTableColumn<ScheduleRow>[] = [
    { key: "subject", header: "Subject", render: (r) => `${r.subject_code} · ${r.subject}` },
    { key: "class_section", header: "Class" },
    { key: "session", header: "Session" },
    { key: "venue", header: "Venue", render: (r) => r.venue || "—" },
    { key: "time", header: "Time", render: (r) => `${r.start_time}–${r.end_time}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={
          currentExam
            ? `${currentExam.title || "Examination"} · ${currentExam.academic_year} · Semester ${currentExam.semester}`
            : examsLoading
              ? "Loading examinations…"
              : "No examinations created yet — start in Examinations."
        }
        actions={
          sortedExams.length > 0 && (
            <ExamPicker value={currentExam?.id ?? null} onChange={setSelectedExamId} />
          )
        }
      />

      {!examsLoading && sortedExams.length === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No examinations exist yet.{" "}
          <Link href="/examination/exams" className="font-medium text-blue-700 hover:underline">
            Create one
          </Link>{" "}
          to get started.
        </div>
      )}

      {currentExam && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Examinations on record" value={sortedExams.length} icon={CalendarIcon} />
            <StatCard
              label="Pass percentage"
              value={summary ? `${summary.pass_percentage}%` : "—"}
              icon={GraduationCapIcon}
            />
            <StatCard
              label="Papers evaluated"
              value={summary?.total_papers ?? "—"}
              icon={PeopleIcon}
            />
            <StatCard
              label="Revaluation requests"
              value={examRevaluationCount}
              icon={RefreshIcon}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-900">Examination lifecycle</h3>
              <ol className="flex flex-col gap-3">
                {STATUS_STEPS.map((step, i) => (
                  <li key={step.key} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        i <= currentStepIndex
                          ? "bg-blue-700 text-white"
                          : "border border-slate-300 text-slate-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={i <= currentStepIndex ? "text-sm text-slate-900" : "text-sm text-slate-400"}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-slate-500">
                {pendingRevaluationCount} revaluation request{pendingRevaluationCount === 1 ? "" : "s"} still pending for this examination.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-900">Pass rate by department</h3>
              {!passRates || passRates.length === 0 ? (
                <p className="text-sm text-slate-500">No marks entered yet for this examination.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {passRates.map((d) => (
                    <div key={d.department_id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">{d.department_code}</span>
                        <span className="text-slate-500">{d.pass_percentage}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-700"
                          style={{ width: `${Math.min(100, d.pass_percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Today&apos;s examinations</h3>
            <DataTable
              columns={scheduleColumns}
              rows={todaysSessions}
              rowKey={(row, i) => `${row.subject_code}-${i}`}
              emptyMessage="No examinations scheduled for today under the published timetable."
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/examination/timetable"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              New timetable version
            </Link>
            <Link
              href="/examination/seating"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Allocate halls
            </Link>
            <Link
              href="/examination/results"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Publish results
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

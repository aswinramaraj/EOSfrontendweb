"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { StatCard } from "@/shared/components/ui/StatCard";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { AwardIcon, GraduationCapIcon, PeopleIcon, RefreshIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { useIsSeniorCoe } from "@/modules/examination/hooks/useIsSeniorCoe";
import {
  useResultsSummary,
  usePassRateByDepartment,
  useRankHolders,
  useResultPublications,
  usePublishResults,
} from "@/modules/examination/hooks/useResults";
import type { RankHolder } from "@/modules/examination/types/results";

export default function ResultsPage() {
  const { show } = useToast();
  const isSeniorCoe = useIsSeniorCoe();

  const { data: sortedExams } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const examId = selectedExamId ?? sortedExams[0]?.id ?? null;

  const { data: summary } = useResultsSummary(examId ?? undefined);
  const { data: passRates } = usePassRateByDepartment(examId ?? undefined);
  const { data: rankHolders } = useRankHolders(examId ?? undefined, 10);
  const { data: publications } = useResultPublications();
  const publishResults = usePublishResults();

  const examPublications = (publications ?? []).filter((p) => p.exam_id === examId);
  const alreadyPublished = examPublications.some((p) => p.publication_type === "original");

  function handlePublish() {
    if (!examId) return;
    publishResults.mutate(examId, {
      onSuccess: () => show("Results published.", "success"),
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  const rankColumns: DataTableColumn<RankHolder>[] = [
    { key: "student", header: "Student", render: (r) => r.name },
    { key: "student_id_no", header: "Student ID" },
    { key: "gpa", header: "Current-exam GPA", render: (r) => r.current_exam_gpa.toFixed(2) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Results"
        description="Grades, current-exam GPA, moderation and publication."
        actions={
          <div className="flex items-center gap-2">
            <ExamPicker value={examId} onChange={setSelectedExamId} />
            <Button
              variant="primary"
              disabled={!examId || alreadyPublished || !isSeniorCoe}
              isPending={publishResults.isPending}
              onClick={handlePublish}
            >
              {alreadyPublished ? "Published" : isSeniorCoe ? "Publish results" : "Senior COE only"}
            </Button>
          </div>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pass percentage" value={`${summary.pass_percentage}%`} icon={GraduationCapIcon} />
          <StatCard label="Average percentage" value={`${summary.average_percentage}%`} icon={AwardIcon} />
          <StatCard label="Arrears" value={summary.arrears_count} icon={PeopleIcon} />
          <StatCard label="Papers moderated" value={summary.moderated_count} icon={RefreshIcon} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                    <div className="h-2 rounded-full bg-blue-700" style={{ width: `${Math.min(100, d.pass_percentage)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-1 text-sm font-bold text-slate-900">Rank holders</h3>
          <p className="mb-4 text-xs text-slate-500">
            Current-exam GPA — a credit-weighted average for this examination only, not cross-semester CGPA.
          </p>
          <DataTable columns={rankColumns} rows={rankHolders ?? []} rowKey={(r) => r.student_id} emptyMessage="No marks entered yet." />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Publication history</h3>
        {examPublications.length === 0 ? (
          <p className="text-sm text-slate-500">Results have not been published for this examination yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {examPublications.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                <span className="capitalize text-slate-700">{p.publication_type}</span>
                <StatusPill tone="green">{new Date(p.published_at).toLocaleString()}</StatusPill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

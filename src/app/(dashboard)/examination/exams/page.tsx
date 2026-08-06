"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { StatusPill, type PillTone } from "@/shared/components/ui/StatusPill";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon, CheckIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useExamTypes } from "@/modules/examination/hooks/useExamTypes";
import { useDeleteExamType } from "@/modules/examination/hooks/useExamTypeMutations";
import { useExams } from "@/modules/examination/hooks/useExams";
import { useDeleteExam, useCompleteExam } from "@/modules/examination/hooks/useExamMutations";
import { useBatches } from "@/modules/batches/hooks/useBatches";
import { ExamTypeFormModal } from "@/modules/examination/components/exams/ExamTypeFormModal";
import { ExamFormModal } from "@/modules/examination/components/exams/ExamFormModal";
import type { Exam, ExamStatus, ExamType } from "@/modules/examination/types/exams";

const STATUS_TONE: Record<ExamStatus, PillTone> = {
  created: "slate",
  timetable_published: "blue",
  completed: "amber",
  results_published: "green",
};

const STATUS_LABEL: Record<ExamStatus, string> = {
  created: "Created",
  timetable_published: "Timetable published",
  completed: "Completed",
  results_published: "Results published",
};

export default function ExamsSetupPage() {
  const { show } = useToast();

  const { data: examTypes, isLoading: examTypesLoading, error: examTypesError } = useExamTypes();
  const { data: exams, isLoading: examsLoading, error: examsError } = useExams();
  const { data: batches } = useBatches();

  const deleteExamType = useDeleteExamType();
  const deleteExam = useDeleteExam();
  const completeExam = useCompleteExam();

  const [examTypeFormTarget, setExamTypeFormTarget] = useState<ExamType | "new" | null>(null);
  const [examTypeDeleteTarget, setExamTypeDeleteTarget] = useState<ExamType | null>(null);
  const [examFormTarget, setExamFormTarget] = useState<Exam | "new" | null>(null);
  const [examDeleteTarget, setExamDeleteTarget] = useState<Exam | null>(null);

  const batchName = (id: number) => batches?.find((b) => b.id === id)?.name ?? `#${id}`;
  const examTypeName = (id: number) => examTypes?.find((t) => t.id === id)?.name ?? `#${id}`;

  const examTypeColumns: DataTableColumn<ExamType>[] = [
    { key: "name", header: "Name" },
    { key: "code", header: "Code", render: (row) => row.code ?? "—" },
    {
      key: "category",
      header: "Category",
      render: (row) => <span className="capitalize">{row.category}</span>,
    },
    {
      key: "is_university",
      header: "University-conducted",
      render: (row) => (row.is_university ? "Yes" : "No"),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setExamTypeFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit examination type"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExamTypeDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete examination type"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const examColumns: DataTableColumn<Exam>[] = [
    {
      key: "title",
      header: "Examination",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.title || examTypeName(row.exam_type_id)}</p>
          <p className="text-xs text-slate-500">{examTypeName(row.exam_type_id)}</p>
        </div>
      ),
    },
    { key: "batch_id", header: "Batch", render: (row) => batchName(row.batch_id) },
    {
      key: "academic_year",
      header: "Academic year / semester",
      render: (row) => `${row.academic_year} · Sem ${row.semester}`,
    },
    {
      key: "dates",
      header: "Dates",
      render: (row) =>
        row.start_date && row.end_date ? `${row.start_date} → ${row.end_date}` : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</StatusPill>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-3">
          {row.status !== "completed" && row.status !== "results_published" && (
            <button
              onClick={() =>
                completeExam.mutate(row.id, {
                  onSuccess: () => show("Examination marked as completed.", "success"),
                  onError: (err: unknown) =>
                    show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
                })
              }
              className="text-slate-400 hover:text-green-700"
              aria-label="Mark examination as completed"
              title="Mark as completed"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setExamFormTarget(row)}
            className="text-slate-400 hover:text-blue-700"
            aria-label="Edit examination"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExamDeleteTarget(row)}
            className="text-slate-400 hover:text-red-600"
            aria-label="Delete examination"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <PageHeader
          title="Examinations"
          description="Every examination cycle — the type, batch, academic year and status every other screen is scoped to."
          actions={
            <Button variant="primary" onClick={() => setExamFormTarget("new")}>
              <PlusIcon className="h-4 w-4" /> Create examination
            </Button>
          }
        />
        <DataTable
          columns={examColumns}
          rows={exams ?? []}
          rowKey={(row) => row.id}
          isLoading={examsLoading}
          error={examsError instanceof ApiError ? examsError.message : examsError ? "Failed to load examinations." : null}
          emptyMessage="No examinations created yet."
        />
      </div>

      <div>
        <PageHeader
          title="Examination types"
          description="The catalogue of examination types (End semester, Arrear, Practical, ...) examinations are created against."
          actions={
            <Button variant="secondary" onClick={() => setExamTypeFormTarget("new")}>
              <PlusIcon className="h-4 w-4" /> Add type
            </Button>
          }
        />
        <DataTable
          columns={examTypeColumns}
          rows={examTypes ?? []}
          rowKey={(row) => row.id}
          isLoading={examTypesLoading}
          error={
            examTypesError instanceof ApiError
              ? examTypesError.message
              : examTypesError
                ? "Failed to load examination types."
                : null
          }
          emptyMessage="No examination types yet."
        />
      </div>

      <ExamFormModal
        open={examFormTarget !== null}
        exam={examFormTarget === "new" ? null : examFormTarget}
        onClose={() => setExamFormTarget(null)}
      />
      <ExamTypeFormModal
        open={examTypeFormTarget !== null}
        examType={examTypeFormTarget === "new" ? null : examTypeFormTarget}
        onClose={() => setExamTypeFormTarget(null)}
      />

      <ConfirmDialog
        open={examDeleteTarget !== null}
        title="Delete examination"
        message={`Delete "${examDeleteTarget?.title || "this examination"}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteExam.isPending}
        onConfirm={() => {
          if (!examDeleteTarget) return;
          deleteExam.mutate(examDeleteTarget.id, {
            onSuccess: () => {
              show("Examination deleted.", "success");
              setExamDeleteTarget(null);
            },
            onError: (err: unknown) => {
              show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
            },
          });
        }}
        onClose={() => setExamDeleteTarget(null)}
      />

      <ConfirmDialog
        open={examTypeDeleteTarget !== null}
        title="Delete examination type"
        message={`Delete "${examTypeDeleteTarget?.name}"? This can't be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteExamType.isPending}
        onConfirm={() => {
          if (!examTypeDeleteTarget) return;
          deleteExamType.mutate(examTypeDeleteTarget.id, {
            onSuccess: () => {
              show("Examination type deleted.", "success");
              setExamTypeDeleteTarget(null);
            },
            onError: (err: unknown) => {
              show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
            },
          });
        }}
        onClose={() => setExamTypeDeleteTarget(null)}
      />
    </div>
  );
}

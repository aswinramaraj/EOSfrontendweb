"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { DataTable, type DataTableColumn } from "@/shared/components/ui/DataTable";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { MalpracticeFormModal } from "@/modules/examination/components/malpractice/MalpracticeFormModal";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { useMalpracticeIncidents, useDeleteMalpracticeIncident } from "@/modules/examination/hooks/useMalpractice";
import { ACTION_LABELS, NATURE_LABELS } from "@/modules/examination/schemas/malpractice-form.schema";
import type { MalpracticeIncident } from "@/modules/examination/types/malpractice";

export default function MalpracticePage() {
  const { show } = useToast();
  const { data: sortedExams } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const examId = selectedExamId ?? sortedExams[0]?.id ?? null;

  const [formTarget, setFormTarget] = useState<MalpracticeIncident | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MalpracticeIncident | null>(null);

  const { data: incidentPage, isLoading, error } = useMalpracticeIncidents({ exam_id: examId ?? undefined, limit: 50 });
  const deleteIncident = useDeleteMalpracticeIncident();

  const columns: DataTableColumn<MalpracticeIncident>[] = [
    { key: "student", header: "Student", render: (i) => i.students.register_no ?? i.students.student_id_no },
    {
      key: "paper",
      header: "Paper",
      render: (i) => (i.exam_subject_mapping ? `${i.exam_subject_mapping.subjects.subject_code} · ${i.exam_subject_mapping.subjects.name}` : "—"),
    },
    { key: "date", header: "Date", render: (i) => `${i.incident_date.slice(0, 10)} · ${i.session}` },
    { key: "venue", header: "Venue", render: (i) => i.venues?.name ?? "—" },
    { key: "seat", header: "Seat", render: (i) => i.seat_number ?? "—" },
    { key: "nature", header: "Nature", render: (i) => NATURE_LABELS[i.nature] },
    { key: "action", header: "Action taken", render: (i) => ACTION_LABELS[i.action_taken] },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (i) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => setFormTarget(i)} className="text-slate-400 hover:text-blue-700" aria-label="Edit incident">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(i)} className="text-slate-400 hover:text-red-600" aria-label="Delete incident">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Malpractice register"
        description="Record incidents with candidate, venue, paper and action taken."
        actions={
          <div className="flex items-center gap-2">
            <ExamPicker value={examId} onChange={setSelectedExamId} />
            <Button variant="primary" onClick={() => setFormTarget("new")} disabled={!examId}>
              <PlusIcon className="h-4 w-4" /> Record incident
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        rows={incidentPage?.data ?? []}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error instanceof ApiError ? error.message : error ? "Failed to load incidents." : null}
        emptyMessage="No malpractice incidents recorded for this examination."
      />

      {examId && (
        <MalpracticeFormModal
          open={formTarget !== null}
          examId={examId}
          incident={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete incident"
        message="Delete this malpractice record? This can't be undone."
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteIncident.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteIncident.mutate(deleteTarget.id, {
            onSuccess: () => {
              show("Incident deleted.", "success");
              setDeleteTarget(null);
            },
            onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
          });
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

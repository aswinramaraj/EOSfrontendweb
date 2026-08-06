"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { PlusIcon } from "@/shared/components/icons";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { MarksTable } from "@/modules/examination/components/marks/MarksTable";
import { MarkFormModal } from "@/modules/examination/components/marks/MarkFormModal";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { useIsSeniorCoe } from "@/modules/examination/hooks/useIsSeniorCoe";
import { useMarks } from "@/modules/examination/hooks/useMarks";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import {
  useMarksEntryLock,
  useSetMarksEntryLock,
  usePublishMarksEntry,
} from "@/modules/examination/hooks/useMarksEntryLock";
import type { ExamMark } from "@/modules/examination/types/marks";

export default function MarksEntryPage() {
  const { show } = useToast();
  const isSeniorCoe = useIsSeniorCoe();

  const { data: sortedExams } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const examId = selectedExamId ?? sortedExams[0]?.id ?? null;

  const { data: departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const { data: classes } = useClasses();
  const { data: marks } = useMarks();
  const { data: lock } = useMarksEntryLock(examId, departmentId);
  const setLock = useSetMarksEntryLock(examId, departmentId);
  const publish = usePublishMarksEntry(examId, departmentId);

  const [formTarget, setFormTarget] = useState<ExamMark | "new" | null>(null);

  const scopedMarks = useMemo(() => {
    if (!examId) return [];
    return (marks ?? []).filter((m) => {
      if (m.exam_subject_mapping.exam_id !== examId) return false;
      if (departmentId === null) return true;
      const cls = classes?.find((c) => c.id === m.exam_subject_mapping.class_id);
      return cls?.department_id === departmentId;
    });
  }, [marks, examId, departmentId, classes]);

  function onError(err: unknown) {
    show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Marks entry"
        description="COE correction surface — create a missing entry or correct one directly."
        actions={<ExamPicker value={examId} onChange={setSelectedExamId} />}
      />

      {examId && (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-end gap-2">
              <SelectInput
                value={departmentId ?? ""}
                onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : null)}
                className="w-auto"
              >
                <option value="">Select a department</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </SelectInput>
              {lock && (
                <StatusPill tone={lock.is_published ? "green" : lock.is_locked ? "amber" : "slate"}>
                  {lock.is_published ? "Published" : lock.is_locked ? "Locked" : "Open"}
                </StatusPill>
              )}
            </div>
            {departmentId && lock && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  isPending={setLock.isPending}
                  onClick={() =>
                    setLock.mutate(!lock.is_locked, {
                      onSuccess: () => show(lock.is_locked ? "Marks entry unlocked." : "Marks entry locked.", "success"),
                      onError,
                    })
                  }
                >
                  {lock.is_locked ? "Unlock" : "Lock"} entry
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!lock.is_locked || lock.is_published || !isSeniorCoe}
                  isPending={publish.isPending}
                  onClick={() =>
                    publish.mutate(undefined, {
                      onSuccess: () => show("Marks published for this department.", "success"),
                      onError,
                    })
                  }
                >
                  {lock.is_published ? "Published" : isSeniorCoe ? "Publish" : "Senior COE only"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setFormTarget("new")}>
                  <PlusIcon className="h-4 w-4" /> New entry
                </Button>
              </div>
            )}
          </div>

          {!departmentId ? (
            <p className="text-sm text-slate-500">Select a department to view and correct its mark entries.</p>
          ) : (
            <MarksTable rows={scopedMarks} onEdit={(m) => setFormTarget(m)} />
          )}
        </div>
      )}

      {examId && (
        <MarkFormModal
          open={formTarget !== null}
          examId={examId}
          departmentId={departmentId}
          mark={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}
    </div>
  );
}

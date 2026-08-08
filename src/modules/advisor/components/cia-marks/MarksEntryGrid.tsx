"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useMenteeClasses } from "../../hooks/useStudents";
import { useClassMarks } from "../../hooks/useStudents";
import { useExamTypes } from "../../hooks/useExamTypes";
import { useBulkUpsertMarks } from "../../hooks/useMarks";
import { NoMenteeClasses } from "../NoMenteeClasses";

export function MarksEntryGrid() {
  const { show } = useToast();
  const { data: menteeClasses, isLoading: classesLoading } = useMenteeClasses();
  const [classId, setClassId] = useState<number | undefined>(undefined);
  const activeClassId = classId ?? menteeClasses?.[0]?.class_id;

  const { data: examTypes } = useExamTypes();
  const [examTypeId, setExamTypeId] = useState<number | undefined>(undefined);
  const activeExamTypeId = examTypeId ?? examTypes?.[0]?.id;

  const { data: classMarks, isLoading } = useClassMarks(activeClassId, activeExamTypeId);
  const [mappingId, setMappingId] = useState<number | undefined>(undefined);
  const activeMappingId = mappingId ?? classMarks?.subjects[0]?.exam_subject_mapping_id;

  const [maxMarks, setMaxMarks] = useState(50);
  const [entries, setEntries] = useState<Record<number, { marks?: number; absent: boolean }>>({});

  const bulkUpsert = useBulkUpsertMarks(activeClassId ?? -1);

  useEffect(() => {
    if (!classMarks || !activeMappingId) return;
    const next: Record<number, { marks?: number; absent: boolean }> = {};
    for (const student of classMarks.students) {
      const cell = student.marks.find((m) => m.exam_subject_mapping_id === activeMappingId);
      next[student.id] = { marks: cell?.marks_obtained ?? undefined, absent: cell?.is_absent ?? false };
      if (cell?.max_marks) setMaxMarks(cell.max_marks);
    }
    setEntries(next);
  }, [classMarks, activeMappingId]);

  const activeSubject = useMemo(
    () => classMarks?.subjects.find((s) => s.exam_subject_mapping_id === activeMappingId),
    [classMarks, activeMappingId],
  );

  function handleSave() {
    if (!activeMappingId || !classMarks) return;
    bulkUpsert
      .mutateAsync({
        exam_subject_mapping_id: activeMappingId,
        max_marks: maxMarks,
        items: classMarks.students.map((s) => ({
          student_id: s.id,
          marks_obtained: entries[s.id]?.absent ? undefined : entries[s.id]?.marks,
          is_absent: entries[s.id]?.absent ?? false,
        })),
      })
      .then(() => show("Marks saved.", "success"))
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  if (classesLoading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!menteeClasses || menteeClasses.length === 0) {
    return (
      <div>
        <PageHeader title="CIA marks" />
        <NoMenteeClasses />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="CIA marks"
        description="Enter marks for the subject you teach in this class."
        actions={
          <Button variant="primary" isPending={bulkUpsert.isPending} onClick={handleSave} disabled={!activeMappingId}>
            Save marks
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        {menteeClasses.length > 1 && (
          <SelectInput className="w-auto" value={activeClassId} onChange={(e) => setClassId(Number(e.target.value))}>
            {menteeClasses.map((c, index) => (
              <option key={`${c.class_id}-${c.academic_year ?? index}`} value={c.class_id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        )}

        <SelectInput
          className="w-auto"
          value={activeExamTypeId ?? ""}
          onChange={(e) => setExamTypeId(e.target.value ? Number(e.target.value) : undefined)}
        >
          {examTypes?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          className="w-auto"
          value={activeMappingId ?? ""}
          onChange={(e) => setMappingId(e.target.value ? Number(e.target.value) : undefined)}
        >
          <option value="">Select subject</option>
          {classMarks?.subjects.map((s) => (
            <option key={s.exam_subject_mapping_id} value={s.exam_subject_mapping_id}>
              {s.subject.name} ({s.subject.subject_code})
            </option>
          ))}
        </SelectInput>

        {activeSubject && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Max marks
            <NumberInput
              className="w-20"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value) || 0)}
            />
          </label>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {!isLoading && activeMappingId && classMarks && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Marks
                </th>
                <th className="px-4 py-3 text-left text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                  Absent
                </th>
              </tr>
            </thead>
            <tbody>
              {classMarks.students.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 last:border-b-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.student_id_no}</p>
                  </td>
                  <td className="px-4 py-3">
                    <NumberInput
                      className="w-24"
                      min={0}
                      max={maxMarks}
                      disabled={entries[s.id]?.absent}
                      value={entries[s.id]?.marks ?? ""}
                      onChange={(e) =>
                        setEntries((prev) => ({
                          ...prev,
                          [s.id]: { ...prev[s.id], marks: e.target.value ? Number(e.target.value) : undefined, absent: prev[s.id]?.absent ?? false },
                        }))
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={entries[s.id]?.absent ?? false}
                      onChange={(e) =>
                        setEntries((prev) => ({
                          ...prev,
                          [s.id]: { marks: prev[s.id]?.marks, absent: e.target.checked },
                        }))
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

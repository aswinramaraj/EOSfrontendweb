"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useExamSubjectMappings, useMapSubjects } from "../../hooks/useExamSubjectMapping";

interface MapSubjectsPanelProps {
  examId: number;
}

export function MapSubjectsPanel({ examId }: MapSubjectsPanelProps) {
  const { show } = useToast();
  const { data: classes } = useClasses();
  const { data: departments } = useDepartments();
  const { data: mappings } = useExamSubjectMappings();
  const mapSubjects = useMapSubjects();

  const [classId, setClassId] = useState<number | "">("");

  const departmentName = (id: number) => departments?.find((d) => d.id === id)?.name ?? `#${id}`;
  const classLabel = (id: number) => {
    const cls = classes?.find((c) => c.id === id);
    if (!cls) return `#${id}`;
    return `${departmentName(cls.department_id)} · Sem ${cls.current_semester ?? "—"} · Section ${cls.section}`;
  };

  const examMappings = (mappings ?? []).filter((m) => m.exam_id === examId);
  const mappedClassIds = [...new Set(examMappings.map((m) => m.class_id))];
  const unmappedClasses = (classes ?? []).filter((c) => !mappedClassIds.includes(c.id));

  function handleMap() {
    if (!classId) return;
    mapSubjects.mutate(
      { exam_id: examId, class_id: classId },
      {
        onSuccess: (result) => {
          show(`Mapped ${result.total_subjects} subject(s) for this class.`, "success");
          setClassId("");
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-1 text-sm font-bold text-slate-900">Map subjects to this examination</h3>
      <p className="mb-4 text-xs text-slate-500">
        Pulls every subject already assigned to the class — do this once per class before scheduling.
      </p>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <SelectInput
          value={classId}
          onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : "")}
          className="w-auto min-w-64"
        >
          <option value="">Select a class</option>
          {unmappedClasses.map((c) => (
            <option key={c.id} value={c.id}>
              {classLabel(c.id)}
            </option>
          ))}
        </SelectInput>
        <Button variant="primary" onClick={handleMap} disabled={!classId} isPending={mapSubjects.isPending}>
          Map subjects
        </Button>
      </div>

      {mappedClassIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mappedClassIds.map((id) => {
            const count = examMappings.filter((m) => m.class_id === id).length;
            return (
              <span
                key={id}
                className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
              >
                {classLabel(id)} · {count} paper{count === 1 ? "" : "s"}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

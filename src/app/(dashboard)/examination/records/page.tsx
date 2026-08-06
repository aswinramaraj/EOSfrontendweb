"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { ExamPicker } from "@/modules/examination/components/ExamPicker";
import { MarksTable } from "@/modules/examination/components/marks/MarksTable";
import { useSortedExams } from "@/modules/examination/hooks/useSortedExams";
import { useMarks } from "@/modules/examination/hooks/useMarks";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import { useDepartments } from "@/modules/departments/hooks/useDepartments";

export default function MarkRecordsPage() {
  const { data: sortedExams } = useSortedExams();
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const examId = selectedExamId ?? sortedExams[0]?.id ?? null;

  const { data: departments } = useDepartments();
  const [departmentId, setDepartmentId] = useState<number | null>(null);

  const { data: classes } = useClasses();
  const { data: marks } = useMarks();

  const scopedMarks = useMemo(() => {
    if (!examId) return [];
    return (marks ?? []).filter((m) => {
      if (m.exam_subject_mapping.exam_id !== examId) return false;
      if (departmentId === null) return true;
      const cls = classes?.find((c) => c.id === m.exam_subject_mapping.class_id);
      return cls?.department_id === departmentId;
    });
  }, [marks, examId, departmentId, classes]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mark records"
        description="College-wide mark data across departments for the selected examination — read-only."
        actions={<ExamPicker value={examId} onChange={setSelectedExamId} />}
      />

      <div className="flex items-end gap-2">
        <SelectInput
          value={departmentId ?? ""}
          onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : null)}
          className="w-auto"
        >
          <option value="">All departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </SelectInput>
      </div>

      <MarksTable rows={scopedMarks} />
    </div>
  );
}

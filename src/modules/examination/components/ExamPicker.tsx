"use client";

import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useSortedExams } from "../hooks/useSortedExams";

interface ExamPickerProps {
  value: number | null;
  onChange: (examId: number) => void;
  className?: string;
}

/** Shared "pick an exam" control — nearly every screen past the dashboard is scoped to one exam. */
export function ExamPicker({ value, onChange, className }: ExamPickerProps) {
  const { data: exams } = useSortedExams();

  if (!exams || exams.length === 0) return null;

  return (
    <SelectInput
      value={value ?? exams[0]?.id ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className={className ?? "w-auto"}
    >
      {exams.map((exam) => (
        <option key={exam.id} value={exam.id}>
          {exam.title || `Examination #${exam.id}`} · {exam.academic_year} · Sem {exam.semester}
        </option>
      ))}
    </SelectInput>
  );
}

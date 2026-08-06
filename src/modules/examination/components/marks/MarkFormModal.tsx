"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { useExamSubjectMappings } from "../../hooks/useExamSubjectMapping";
import { useSubjects } from "@/modules/subjects/hooks/useSubjects";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import { useCreateMark, useUpdateMark } from "../../hooks/useMarks";
import { markFormSchema, type MarkFormValues } from "../../schemas/mark-form.schema";
import type { CreateMarkInput, ExamMark } from "../../types/marks";

interface MarkFormModalProps {
  open: boolean;
  examId: number;
  departmentId: number | null;
  mark: ExamMark | null;
  onClose: () => void;
}

function toDefaults(mark: ExamMark | null): MarkFormValues {
  return {
    exam_subject_mapping_id: mark?.exam_subject_mapping_id,
    student_id: mark?.student_id,
    marks_obtained: mark?.marks_obtained ?? undefined,
    max_marks: mark?.max_marks,
    is_absent: mark?.is_absent ?? false,
  };
}

export function MarkFormModal({ open, examId, departmentId, mark, onClose }: MarkFormModalProps) {
  const { show } = useToast();
  const isEditing = mark !== null;

  const { data: mappings } = useExamSubjectMappings();
  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses();

  const createMark = useCreateMark();
  const updateMark = useUpdateMark();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MarkFormValues>({
    resolver: zodResolver(markFormSchema),
    defaultValues: toDefaults(mark),
  });

  useEffect(() => {
    reset(toDefaults(mark));
  }, [mark, open, reset]);

  const eligibleMappings = (mappings ?? []).filter((m) => {
    if (m.exam_id !== examId) return false;
    if (departmentId === null) return true;
    const cls = classes?.find((c) => c.id === m.class_id);
    return cls?.department_id === departmentId;
  });

  function mappingLabel(mappingId: number) {
    const mapping = eligibleMappings.find((m) => m.id === mappingId);
    const subject = subjects?.find((s) => s.id === mapping?.subject_id);
    return subject ? `${subject.subject_code} · ${subject.name}` : `#${mappingId}`;
  }

  function onSubmit(values: MarkFormValues) {
    if (isEditing) {
      updateMark
        .mutateAsync({
          id: mark.id,
          input: {
            marks_obtained: values.marks_obtained,
            max_marks: values.max_marks,
            is_absent: values.is_absent,
          },
        })
        .then(() => {
          show("Mark updated.", "success");
          onClose();
        })
        .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
      return;
    }

    const input: CreateMarkInput = {
      exam_subject_mapping_id: values.exam_subject_mapping_id!,
      student_id: values.student_id!,
      marks_obtained: values.marks_obtained,
      max_marks: values.max_marks!,
      is_absent: values.is_absent,
    };
    createMark
      .mutateAsync(input)
      .then(() => {
        show("Mark entry created.", "success");
        onClose();
      })
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  const isPending = createMark.isPending || updateMark.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Correct mark entry" : "New mark entry"} widthClassName="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {!isEditing && (
          <>
            <FormField label="Paper" htmlFor="mark-mapping" required error={errors.exam_subject_mapping_id?.message}>
              <SelectInput id="mark-mapping" hasError={!!errors.exam_subject_mapping_id} {...register("exam_subject_mapping_id", numberFieldOptions)}>
                <option value="">Select a paper</option>
                {eligibleMappings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {mappingLabel(m.id)}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Student ID" htmlFor="mark-student" required hint="No student directory API is exposed yet — enter the numeric ID." error={errors.student_id?.message}>
              <NumberInput id="mark-student" hasError={!!errors.student_id} {...register("student_id", numberFieldOptions)} />
            </FormField>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Marks obtained" htmlFor="mark-obtained" error={errors.marks_obtained?.message}>
            <NumberInput id="mark-obtained" hasError={!!errors.marks_obtained} {...register("marks_obtained", numberFieldOptions)} />
          </FormField>
          <FormField label="Maximum marks" htmlFor="mark-max" required error={errors.max_marks?.message}>
            <NumberInput id="mark-max" hasError={!!errors.max_marks} {...register("max_marks", numberFieldOptions)} />
          </FormField>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("is_absent")} />
          Absent
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Create entry"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useBatches } from "@/modules/batches/hooks/useBatches";
import { useExamTypes } from "../../hooks/useExamTypes";
import { useCreateExam, useUpdateExam } from "../../hooks/useExamMutations";
import { examFormSchema, type ExamFormValues } from "../../schemas/exam-form.schema";
import type { CreateExamInput, Exam } from "../../types/exams";

interface ExamFormModalProps {
  open: boolean;
  exam: Exam | null;
  onClose: () => void;
}

function toDefaults(exam: Exam | null): ExamFormValues {
  return {
    exam_type_id: exam?.exam_type_id,
    batch_id: exam?.batch_id,
    academic_year: exam?.academic_year ?? "",
    semester: exam?.semester,
    title: exam?.title ?? undefined,
    start_date: exam?.start_date ?? undefined,
    end_date: exam?.end_date ?? undefined,
  };
}

export function ExamFormModal({ open, exam, onClose }: ExamFormModalProps) {
  const { show } = useToast();
  const isEditing = exam !== null;

  const { data: examTypes } = useExamTypes();
  const { data: batches } = useBatches();

  const createExam = useCreateExam();
  const updateExam = useUpdateExam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: toDefaults(exam),
  });

  useEffect(() => {
    reset(toDefaults(exam));
  }, [exam, open, reset]);

  function onSubmit(values: ExamFormValues) {
    const input: CreateExamInput = {
      exam_type_id: values.exam_type_id!,
      batch_id: values.batch_id!,
      academic_year: values.academic_year,
      semester: values.semester!,
      title: values.title,
      start_date: values.start_date,
      end_date: values.end_date,
    };

    const mutation = isEditing
      ? updateExam.mutateAsync({ id: exam.id, input })
      : createExam.mutateAsync(input);

    mutation
      .then(() => {
        show(isEditing ? "Examination saved." : "Examination created.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createExam.isPending || updateExam.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit examination" : "Create examination"}
      widthClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="exam-title" hint="Optional display name" error={errors.title?.message}>
            <TextInput id="exam-title" hasError={!!errors.title} {...register("title", textFieldOptions)} />
          </FormField>
          <FormField label="Examination type" htmlFor="exam-type" required error={errors.exam_type_id?.message}>
            <SelectInput id="exam-type" hasError={!!errors.exam_type_id} {...register("exam_type_id", numberFieldOptions)}>
              <option value="">Select a type</option>
              {examTypes?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Batch" htmlFor="exam-batch" required error={errors.batch_id?.message}>
            <SelectInput id="exam-batch" hasError={!!errors.batch_id} {...register("batch_id", numberFieldOptions)}>
              <option value="">Select a batch</option>
              {batches?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Academic year" htmlFor="exam-academic-year" required hint="YYYY-YYYY" error={errors.academic_year?.message}>
            <TextInput id="exam-academic-year" placeholder="2025-2026" hasError={!!errors.academic_year} {...register("academic_year")} />
          </FormField>
          <FormField label="Semester" htmlFor="exam-semester" required error={errors.semester?.message}>
            <NumberInput id="exam-semester" hasError={!!errors.semester} {...register("semester", numberFieldOptions)} />
          </FormField>
          <FormField label="Start date" htmlFor="exam-start-date" error={errors.start_date?.message}>
            <TextInput id="exam-start-date" type="date" hasError={!!errors.start_date} {...register("start_date", textFieldOptions)} />
          </FormField>
          <FormField label="End date" htmlFor="exam-end-date" error={errors.end_date?.message}>
            <TextInput id="exam-end-date" type="date" hasError={!!errors.end_date} {...register("end_date", textFieldOptions)} />
          </FormField>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Create examination"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

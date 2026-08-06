"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useCreateExamType, useUpdateExamType } from "../../hooks/useExamTypeMutations";
import { examTypeFormSchema, type ExamTypeFormValues } from "../../schemas/exam-type-form.schema";
import type { CreateExamTypeInput, ExamType } from "../../types/exams";

interface ExamTypeFormModalProps {
  open: boolean;
  examType: ExamType | null;
  onClose: () => void;
}

function toDefaults(examType: ExamType | null): ExamTypeFormValues {
  return {
    name: examType?.name ?? "",
    code: examType?.code ?? undefined,
    category: examType?.category ?? "external",
    is_university: examType?.is_university ?? true,
  };
}

export function ExamTypeFormModal({ open, examType, onClose }: ExamTypeFormModalProps) {
  const { show } = useToast();
  const isEditing = examType !== null;

  const createExamType = useCreateExamType();
  const updateExamType = useUpdateExamType();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamTypeFormValues>({
    resolver: zodResolver(examTypeFormSchema),
    defaultValues: toDefaults(examType),
  });

  useEffect(() => {
    reset(toDefaults(examType));
  }, [examType, open, reset]);

  function onSubmit(values: ExamTypeFormValues) {
    const input: CreateExamTypeInput = {
      name: values.name,
      code: values.code,
      category: values.category,
      is_university: values.is_university,
    };

    const mutation = isEditing
      ? updateExamType.mutateAsync({ id: examType.id, input })
      : createExamType.mutateAsync(input);

    mutation
      .then(() => {
        show(isEditing ? "Examination type saved." : "Examination type added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createExamType.isPending || updateExamType.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit examination type" : "Add examination type"}
      widthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Name" htmlFor="et-name" required error={errors.name?.message}>
          <TextInput id="et-name" hasError={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Code" htmlFor="et-code" hint="Short code, e.g. ESE" error={errors.code?.message}>
          <TextInput id="et-code" hasError={!!errors.code} {...register("code", textFieldOptions)} />
        </FormField>
        <FormField label="Category" htmlFor="et-category" error={errors.category?.message}>
          <SelectInput id="et-category" hasError={!!errors.category} {...register("category")}>
            <option value="external">External</option>
            <option value="internal">Internal</option>
          </SelectInput>
        </FormField>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" {...register("is_university")} />
          University-conducted examination
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add examination type"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

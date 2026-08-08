"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { TextInput } from "@/shared/components/ui/TextInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { useFacultyList } from "@/modules/faculty/hooks/useFaculty";
import { useAssignMentor } from "../hooks/useClasses";
import {
  assignMentorSchema,
  type AssignMentorFormValues,
} from "../schemas/assign-mentor.schema";
import type { ClassSummary } from "../types";

interface AssignAdvisorModalProps {
  open: boolean;
  klass: ClassSummary | null;
  onClose: () => void;
}

function defaultAcademicYear(): string {
  const now = new Date();
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

function toDefaults(klass: ClassSummary | null): AssignMentorFormValues {
  return {
    faculty_id: klass?.mentor?.id,
    academic_year: klass?.mentor?.academic_year ?? defaultAcademicYear(),
  };
}

export function AssignAdvisorModal({ open, klass, onClose }: AssignAdvisorModalProps) {
  const { show } = useToast();
  const { data: facultyPage, isLoading: facultyLoading } = useFacultyList({
    status: "active",
    limit: 100,
  });
  const assignMentor = useAssignMentor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignMentorFormValues>({
    resolver: zodResolver(assignMentorSchema),
    defaultValues: toDefaults(klass),
  });

  useEffect(() => {
    reset(toDefaults(klass));
  }, [klass, open, reset]);

  function onSubmit(values: AssignMentorFormValues) {
    if (!klass) return;
    assignMentor
      .mutateAsync({
        classId: klass.id,
        input: { faculty_id: values.faculty_id!, academic_year: values.academic_year },
      })
      .then(() => {
        show("Advisor assigned.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const classLabel = klass
    ? `${klass.course.code}-${klass.section} (${klass.batch.name})`
    : "";

  return (
    <Modal open={open} onClose={onClose} title={klass?.mentor ? "Reassign advisor" : "Assign advisor"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Class" htmlFor="advisor-class">
          <TextInput id="advisor-class" value={classLabel} disabled readOnly />
        </FormField>

        <FormField
          label="Faculty"
          htmlFor="advisor-faculty"
          required
          error={errors.faculty_id?.message}
        >
          <SelectInput
            id="advisor-faculty"
            hasError={!!errors.faculty_id}
            disabled={facultyLoading}
            {...register("faculty_id", numberFieldOptions)}
          >
            <option value="">Select a faculty member</option>
            {facultyPage?.data.map((f) => (
              <option key={f.id} value={f.id}>
                {f.first_name} {f.last_name ?? ""} — {f.department.code}
                {f.designation ? ` (${f.designation})` : ""}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField
          label="Academic year"
          htmlFor="advisor-academic-year"
          required
          hint="Format: YYYY-YY, e.g. 2025-26"
          error={errors.academic_year?.message}
        >
          <TextInput
            id="advisor-academic-year"
            hasError={!!errors.academic_year}
            {...register("academic_year")}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={assignMentor.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={assignMentor.isPending}>
            {klass?.mentor ? "Reassign" : "Assign"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

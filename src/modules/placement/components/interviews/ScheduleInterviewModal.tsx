"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DatePicker } from "@/shared/components/ui/DatePicker";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useEligibleStudents } from "../../hooks/useEligibleStudents";
import { useDriveReport } from "../../hooks/useDriveReport";
import { useCreateInterview, useRescheduleInterview } from "../../hooks/useInterviewMutations";
import { INTERVIEW_ROUNDS, interviewFormSchema, type InterviewFormValues } from "../../schemas/interview-form.schema";
import type { InterviewRow } from "../../types";

interface ScheduleInterviewModalProps {
  open: boolean;
  interview: InterviewRow | null;
  onClose: () => void;
}

function toDefaults(interview: InterviewRow | null): InterviewFormValues {
  return {
    studentId: interview?.studentId ?? 0,
    driveId: interview?.driveId ?? 0,
    interviewDate: interview?.interviewDate ?? "",
    roundLabel: interview?.roundLabel ?? INTERVIEW_ROUNDS[0],
    slotLabel: interview?.slotLabel ?? "",
    panelMember: interview?.panelMember ?? "",
  };
}

export function ScheduleInterviewModal({ open, interview, onClose }: ScheduleInterviewModalProps) {
  const { show } = useToast();
  const isRescheduling = interview !== null;

  const { data: students } = useEligibleStudents();
  const { data: drives } = useDriveReport();
  const createInterview = useCreateInterview();
  const rescheduleInterview = useRescheduleInterview();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: toDefaults(interview),
  });

  useEffect(() => {
    reset(toDefaults(interview));
  }, [interview, open, reset]);

  function onSubmit(values: InterviewFormValues) {
    const mutation = isRescheduling
      ? rescheduleInterview.mutateAsync({
          id: interview.id,
          input: {
            interviewDate: values.interviewDate,
            roundLabel: values.roundLabel,
            slotLabel: values.slotLabel,
            panelMember: values.panelMember,
          },
        })
      : createInterview.mutateAsync(values);

    mutation
      .then(() => {
        show(isRescheduling ? "Interview rescheduled." : "Interview scheduled.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createInterview.isPending || rescheduleInterview.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isRescheduling ? "Reschedule interview" : "Schedule interview"}
      subtitle="Slot is checked against the student timetable."
      widthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Student" htmlFor="interview-student" required error={errors.studentId?.message}>
          {isRescheduling ? (
            <TextInput id="interview-student" disabled readOnly value={interview.studentName} />
          ) : (
            <SelectInput
              id="interview-student"
              hasError={!!errors.studentId}
              {...register("studentId", { valueAsNumber: true })}
            >
              <option value={0}>Select a student</option>
              {students?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? s.studentIdNo}
                </option>
              ))}
            </SelectInput>
          )}
        </FormField>

        <FormField label="Company" htmlFor="interview-drive" required error={errors.driveId?.message}>
          {isRescheduling ? (
            <TextInput
              id="interview-drive"
              disabled
              readOnly
              value={`${interview.companyName}${interview.jobRole ? ` · ${interview.jobRole}` : ""}`}
            />
          ) : (
            <SelectInput id="interview-drive" hasError={!!errors.driveId} {...register("driveId", { valueAsNumber: true })}>
              <option value={0}>Select a company</option>
              {drives?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.companyName}
                  {d.jobRole ? ` · ${d.jobRole}` : ""}
                </option>
              ))}
            </SelectInput>
          )}
        </FormField>

        <FormField label="Interview date" htmlFor="interview-date" required error={errors.interviewDate?.message}>
          <DatePicker
            id="interview-date"
            value={watch("interviewDate") || undefined}
            onChange={(v) => setValue("interviewDate", v ?? "", { shouldValidate: true })}
            hasError={!!errors.interviewDate}
            min="2020-01-01"
            max="2030-12-31"
          />
        </FormField>

        <FormField label="Round" htmlFor="interview-round" required error={errors.roundLabel?.message}>
          <SelectInput id="interview-round" hasError={!!errors.roundLabel} {...register("roundLabel")}>
            {INTERVIEW_ROUNDS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Slot" htmlFor="interview-slot" required error={errors.slotLabel?.message}>
          <TextInput
            id="interview-slot"
            placeholder="e.g. 15 Aug · 11:00"
            hasError={!!errors.slotLabel}
            {...register("slotLabel", textFieldOptions)}
          />
        </FormField>

        <FormField label="Panel member" htmlFor="interview-panel" required error={errors.panelMember?.message}>
          <TextInput
            id="interview-panel"
            placeholder="e.g. S. Ramesh"
            hasError={!!errors.panelMember}
            {...register("panelMember", textFieldOptions)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isRescheduling ? "Reschedule" : "Schedule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useRecordInterviewResult } from "../../hooks/useInterviewMutations";
import type { ApplicationStatus, InterviewRow } from "../../types";

const RESULT_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "r1_cleared", label: "Round 1" },
  { value: "r2_cleared", label: "Round 2" },
  { value: "r3_cleared", label: "Round 3" },
  { value: "placed", label: "Selected" },
  { value: "rejected", label: "Rejected" },
];

const resultFormSchema = z.object({
  result: z.enum(["applied", "r1_cleared", "r2_cleared", "r3_cleared", "placed", "rejected"]),
  panelFeedback: z.string().trim().max(500).optional(),
});

type ResultFormValues = z.infer<typeof resultFormSchema>;

interface RecordResultModalProps {
  open: boolean;
  interview: InterviewRow | null;
  onClose: () => void;
}

export function RecordResultModal({ open, interview, onClose }: RecordResultModalProps) {
  const { show } = useToast();
  const recordResult = useRecordInterviewResult();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResultFormValues>({
    resolver: zodResolver(resultFormSchema),
    defaultValues: { result: interview?.applicationStatus ?? "applied", panelFeedback: interview?.panelFeedback ?? "" },
  });

  useEffect(() => {
    reset({ result: interview?.applicationStatus ?? "applied", panelFeedback: interview?.panelFeedback ?? "" });
  }, [interview, open, reset]);

  if (!interview) return null;
  const currentInterview = interview;

  function onSubmit(values: ResultFormValues) {
    recordResult.mutate(
      { id: currentInterview.id, input: { result: values.result, panelFeedback: values.panelFeedback } },
      {
        onSuccess: () => {
          show("Result saved.", "success");
          onClose();
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record interview result"
      subtitle={`${interview.studentName} · ${interview.companyName} · ${interview.roundLabel}`}
      widthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Result" htmlFor="result-select" required error={errors.result?.message}>
          <SelectInput id="result-select" hasError={!!errors.result} {...register("result")}>
            {RESULT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Panel feedback" htmlFor="result-feedback" error={errors.panelFeedback?.message}>
          <TextInput
            id="result-feedback"
            placeholder="Short note for the student file"
            hasError={!!errors.panelFeedback}
            {...register("panelFeedback", textFieldOptions)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={recordResult.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={recordResult.isPending}>
            Save result
          </Button>
        </div>
      </form>
    </Modal>
  );
}

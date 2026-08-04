"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import { ResidentPicker } from "../residents/ResidentPicker";
import { useCreateMessFeedback } from "../../hooks/useMessFeedback";
import {
  messFeedbackFormSchema,
  type MessFeedbackFormValues,
} from "../../schemas/mess-feedback-form.schema";
import type { Resident } from "../../types/residents";

interface MessFeedbackFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function MessFeedbackFormModal({ open, onClose }: MessFeedbackFormModalProps) {
  const { show } = useToast();
  const [resident, setResident] = useState<Resident | null>(null);
  const createFeedback = useCreateMessFeedback();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessFeedbackFormValues>({
    resolver: zodResolver(messFeedbackFormSchema),
    defaultValues: { rating: 5 },
  });

  function handleClose() {
    setResident(null);
    reset({ rating: 5 });
    onClose();
  }

  function onSubmit(values: MessFeedbackFormValues) {
    if (!resident) {
      show("Choose a resident first.", "error");
      return;
    }
    createFeedback.mutate(
      { student_id: resident.id, hostel_id: resident.hostel?.id, ...values },
      {
        onSuccess: () => {
          show("Feedback recorded.", "success");
          handleClose();
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Record mess feedback">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ResidentPicker value={resident} onChange={setResident} label="Resident" />

        <FormField label="Rating" htmlFor="mess-rating" required error={errors.rating?.message}>
          <SelectInput id="mess-rating" hasError={!!errors.rating} {...register("rating", numberFieldOptions)}>
            <option value="5">5 — Excellent</option>
            <option value="4">4 — Good</option>
            <option value="3">3 — Average</option>
            <option value="2">2 — Poor</option>
            <option value="1">1 — Very poor</option>
          </SelectInput>
        </FormField>

        <FormField label="Comment" htmlFor="mess-comment" error={errors.comment?.message}>
          <textarea
            id="mess-comment"
            rows={3}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register("comment", textFieldOptions)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createFeedback.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={createFeedback.isPending}>
            Save feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
}

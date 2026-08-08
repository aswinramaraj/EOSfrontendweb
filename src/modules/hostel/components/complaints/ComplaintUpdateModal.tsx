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
import { useUpdateComplaint } from "../../hooks/useComplaints";
import {
  complaintUpdateSchema,
  type ComplaintUpdateValues,
} from "../../schemas/complaint-update.schema";
import type { Complaint } from "../../types/complaints";

interface ComplaintUpdateModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

function toDefaults(complaint: Complaint | null): ComplaintUpdateValues {
  return {
    status: complaint?.status ?? "open",
    priority: complaint?.priority ?? "medium",
    assigned_to: complaint?.assigned_to ?? undefined,
    resolution_note: complaint?.resolution_note ?? undefined,
  };
}

export function ComplaintUpdateModal({ complaint, onClose }: ComplaintUpdateModalProps) {
  const { show } = useToast();
  const updateComplaint = useUpdateComplaint();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintUpdateValues>({
    resolver: zodResolver(complaintUpdateSchema),
    defaultValues: toDefaults(complaint),
  });

  useEffect(() => {
    reset(toDefaults(complaint));
  }, [complaint, reset]);

  function onSubmit(values: ComplaintUpdateValues) {
    if (!complaint) return;
    updateComplaint.mutate(
      { id: complaint.id, input: values },
      {
        onSuccess: () => {
          show("Ticket updated.", "success");
          onClose();
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <Modal open={complaint !== null} onClose={onClose} title={complaint?.title ?? ""}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Status" htmlFor="complaint-status-edit" required error={errors.status?.message}>
          <SelectInput id="complaint-status-edit" hasError={!!errors.status} {...register("status")}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </SelectInput>
        </FormField>

        <FormField label="Priority" htmlFor="complaint-priority-edit" required error={errors.priority?.message}>
          <SelectInput id="complaint-priority-edit" hasError={!!errors.priority} {...register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </SelectInput>
        </FormField>

        <FormField label="Assigned to" htmlFor="complaint-assigned" error={errors.assigned_to?.message}>
          <TextInput
            id="complaint-assigned"
            hasError={!!errors.assigned_to}
            {...register("assigned_to", textFieldOptions)}
          />
        </FormField>

        <FormField label="Resolution note" htmlFor="complaint-resolution" error={errors.resolution_note?.message}>
          <textarea
            id="complaint-resolution"
            rows={3}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register("resolution_note", textFieldOptions)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={updateComplaint.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={updateComplaint.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

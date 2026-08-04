"use client";

import { useState } from "react";
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
import { ResidentPicker } from "../residents/ResidentPicker";
import { useCreateComplaint } from "../../hooks/useComplaints";
import { complaintFormSchema, type ComplaintFormValues } from "../../schemas/complaint-form.schema";
import type { Resident } from "../../types/residents";

interface ComplaintFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function ComplaintFormModal({ open, onClose }: ComplaintFormModalProps) {
  const { show } = useToast();
  const [resident, setResident] = useState<Resident | null>(null);
  const createComplaint = useCreateComplaint();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: { category: "other", title: "", priority: "medium" },
  });

  function handleClose() {
    setResident(null);
    reset({ category: "other", title: "", priority: "medium" });
    onClose();
  }

  function onSubmit(values: ComplaintFormValues) {
    if (!resident) {
      show("Choose a resident first.", "error");
      return;
    }
    createComplaint.mutate(
      { student_id: resident.id, hostel_id: resident.hostel?.id, ...values },
      {
        onSuccess: () => {
          show("Complaint logged.", "success");
          handleClose();
        },
        onError: (err: unknown) => {
          show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        },
      },
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="New ticket">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <ResidentPicker value={resident} onChange={setResident} label="Raised by" />

        <FormField label="Category" htmlFor="complaint-category" required error={errors.category?.message}>
          <SelectInput id="complaint-category" hasError={!!errors.category} {...register("category")}>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="carpentry">Carpentry</option>
            <option value="network">Network</option>
            <option value="mess">Mess</option>
            <option value="facilities">Facilities</option>
            <option value="other">Other</option>
          </SelectInput>
        </FormField>

        <FormField label="Title" htmlFor="complaint-title" required error={errors.title?.message}>
          <TextInput id="complaint-title" hasError={!!errors.title} {...register("title")} />
        </FormField>

        <FormField label="Description" htmlFor="complaint-description" error={errors.description?.message}>
          <textarea
            id="complaint-description"
            rows={3}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register("description", textFieldOptions)}
          />
        </FormField>

        <FormField label="Priority" htmlFor="complaint-priority" required error={errors.priority?.message}>
          <SelectInput id="complaint-priority" hasError={!!errors.priority} {...register("priority")}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </SelectInput>
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={createComplaint.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={createComplaint.isPending}>
            Log ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}

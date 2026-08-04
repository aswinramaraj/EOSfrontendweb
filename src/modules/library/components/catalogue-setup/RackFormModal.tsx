"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useCreateRack, useUpdateRack } from "../../hooks/useRacks";
import { rackFormSchema, type RackFormValues } from "../../schemas/rack-form.schema";
import type { Rack } from "../../types/racks";

interface RackFormModalProps {
  open: boolean;
  rack: Rack | null;
  onClose: () => void;
}

export function RackFormModal({ open, rack, onClose }: RackFormModalProps) {
  const { show } = useToast();
  const createRack = useCreateRack();
  const updateRack = useUpdateRack();
  const isEditing = rack !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RackFormValues>({
    resolver: zodResolver(rackFormSchema),
    defaultValues: {
      rack_code: rack?.rack_code ?? "",
      shelves: rack?.shelves ?? undefined,
      subject_range: rack?.subject_range ?? undefined,
    },
  });

  useEffect(() => {
    reset({
      rack_code: rack?.rack_code ?? "",
      shelves: rack?.shelves ?? undefined,
      subject_range: rack?.subject_range ?? undefined,
    });
  }, [rack, open, reset]);

  function onSubmit(values: RackFormValues) {
    const mutation = isEditing
      ? updateRack.mutateAsync({ id: rack.id, input: values })
      : createRack.mutateAsync(values);

    mutation
      .then(() => {
        show(isEditing ? "Rack updated." : "Rack added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createRack.isPending || updateRack.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit rack" : "Add rack"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Rack code" htmlFor="rack-code" required error={errors.rack_code?.message}>
          <TextInput id="rack-code" hasError={!!errors.rack_code} {...register("rack_code")} />
        </FormField>
        <FormField label="Shelves" htmlFor="rack-shelves" error={errors.shelves?.message}>
          <NumberInput
            id="rack-shelves"
            hasError={!!errors.shelves}
            {...register("shelves", numberFieldOptions)}
          />
        </FormField>
        <FormField
          label="Subject range"
          htmlFor="rack-subject-range"
          hint="e.g. Mathematics, humanities"
          error={errors.subject_range?.message}
        >
          <TextInput
            id="rack-subject-range"
            hasError={!!errors.subject_range}
            {...register("subject_range", textFieldOptions)}
          />
        </FormField>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add rack"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

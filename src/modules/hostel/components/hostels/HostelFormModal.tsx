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
import { useCreateHostel, useUpdateHostel } from "../../hooks/useHostels";
import { hostelFormSchema, type HostelFormValues } from "../../schemas/hostel-form.schema";
import type { Hostel } from "../../types/hostels";

interface HostelFormModalProps {
  open: boolean;
  hostel: Hostel | null;
  onClose: () => void;
}

function toDefaults(hostel: Hostel | null): HostelFormValues {
  return {
    name: hostel?.name ?? "",
    code: hostel?.code ?? "",
    wing: hostel?.wing ?? "boys",
    warden_user_id: hostel?.warden?.id,
    phone: hostel?.phone ?? undefined,
    mess_type: hostel?.mess_type ?? undefined,
    established_year: hostel?.established_year ?? undefined,
  };
}

export function HostelFormModal({ open, hostel, onClose }: HostelFormModalProps) {
  const { show } = useToast();
  const isEditing = hostel !== null;

  const createHostel = useCreateHostel();
  const updateHostel = useUpdateHostel();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HostelFormValues>({
    resolver: zodResolver(hostelFormSchema),
    defaultValues: toDefaults(hostel),
  });

  useEffect(() => {
    reset(toDefaults(hostel));
  }, [hostel, open, reset]);

  function onSubmit(values: HostelFormValues) {
    const mutation = isEditing
      ? updateHostel.mutateAsync({ id: hostel.id, input: values })
      : createHostel.mutateAsync(values);

    mutation
      .then(() => {
        show(isEditing ? "Hostel updated." : "Hostel added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createHostel.isPending || updateHostel.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit hostel" : "Add hostel"} widthClassName="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Name" htmlFor="hostel-name" required error={errors.name?.message}>
            <TextInput id="hostel-name" hasError={!!errors.name} {...register("name")} />
          </FormField>
          <FormField label="Code" htmlFor="hostel-code" required error={errors.code?.message}>
            <TextInput id="hostel-code" hasError={!!errors.code} {...register("code")} />
          </FormField>

          <FormField label="Wing" htmlFor="hostel-wing" required error={errors.wing?.message}>
            <SelectInput id="hostel-wing" hasError={!!errors.wing} {...register("wing")}>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </SelectInput>
          </FormField>
          <FormField
            label="Warden user ID"
            htmlFor="hostel-warden"
            hint="The user ID of the staff account managing this block"
            error={errors.warden_user_id?.message}
          >
            <NumberInput
              id="hostel-warden"
              hasError={!!errors.warden_user_id}
              {...register("warden_user_id", numberFieldOptions)}
            />
          </FormField>

          <FormField label="Phone" htmlFor="hostel-phone" error={errors.phone?.message}>
            <TextInput id="hostel-phone" hasError={!!errors.phone} {...register("phone", textFieldOptions)} />
          </FormField>
          <FormField label="Mess type" htmlFor="hostel-mess-type" error={errors.mess_type?.message}>
            <TextInput
              id="hostel-mess-type"
              hasError={!!errors.mess_type}
              {...register("mess_type", textFieldOptions)}
            />
          </FormField>

          <FormField
            label="Established year"
            htmlFor="hostel-established-year"
            error={errors.established_year?.message}
          >
            <NumberInput
              id="hostel-established-year"
              hasError={!!errors.established_year}
              {...register("established_year", numberFieldOptions)}
            />
          </FormField>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add hostel"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

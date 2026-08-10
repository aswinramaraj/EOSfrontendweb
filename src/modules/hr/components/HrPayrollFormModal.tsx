"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { TextInput } from "@/shared/components/ui/TextInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { useFaculties } from "@/modules/faculty/hooks/useFaculties";
import { fullName } from "@/modules/faculty/lib/faculty-format";
import { useCreateHrPayroll } from "../hooks/useHrPayroll";
import { hrPayrollFormSchema, type HrPayrollFormValues } from "../schemas/hr-payroll-form.schema";

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = `${CURRENT_YEAR}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

const requiredNumberOptions = { setValueAs: (v: string) => (v === "" ? undefined : Number(v)) };

interface HrPayrollFormModalProps {
  open: boolean;
  onClose: () => void;
}

export function HrPayrollFormModal({ open, onClose }: HrPayrollFormModalProps) {
  const { show } = useToast();
  const { data: facultyData } = useFaculties({ limit: 100 });
  const createPayroll = useCreateHrPayroll();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HrPayrollFormValues>({
    resolver: zodResolver(hrPayrollFormSchema),
    defaultValues: { month: CURRENT_MONTH },
  });

  useEffect(() => {
    if (open) reset({ month: CURRENT_MONTH });
  }, [open, reset]);

  function onSubmit(values: HrPayrollFormValues) {
    createPayroll.mutate(values, {
      onSuccess: () => {
        show("Payroll record added.", "success");
        onClose();
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Add payroll record">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Faculty" htmlFor="payroll-faculty" required error={errors.faculty_id?.message}>
          <SelectInput id="payroll-faculty" hasError={!!errors.faculty_id} {...register("faculty_id", requiredNumberOptions)}>
            <option value="">Select faculty</option>
            {facultyData?.data.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {fullName(faculty)}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Month" htmlFor="payroll-month" required hint="YYYY-MM" error={errors.month?.message}>
          <TextInput id="payroll-month" hasError={!!errors.month} {...register("month")} />
        </FormField>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Basic salary" htmlFor="payroll-basic" required error={errors.basic_salary?.message}>
            <NumberInput id="payroll-basic" hasError={!!errors.basic_salary} {...register("basic_salary", requiredNumberOptions)} />
          </FormField>
          <FormField label="HRA" htmlFor="payroll-hra" required error={errors.hra?.message}>
            <NumberInput id="payroll-hra" hasError={!!errors.hra} {...register("hra", requiredNumberOptions)} />
          </FormField>
          <FormField label="DA" htmlFor="payroll-da" required error={errors.da?.message}>
            <NumberInput id="payroll-da" hasError={!!errors.da} {...register("da", requiredNumberOptions)} />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="PF deduction" htmlFor="payroll-pf" error={errors.pf_deduction?.message}>
            <NumberInput id="payroll-pf" hasError={!!errors.pf_deduction} {...register("pf_deduction", numberFieldOptions)} />
          </FormField>
          <FormField label="Other deductions" htmlFor="payroll-other" error={errors.other_deductions?.message}>
            <NumberInput
              id="payroll-other"
              hasError={!!errors.other_deductions}
              {...register("other_deductions", numberFieldOptions)}
            />
          </FormField>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createPayroll.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={createPayroll.isPending}>
            Add record
          </Button>
        </div>
      </form>
    </Modal>
  );
}

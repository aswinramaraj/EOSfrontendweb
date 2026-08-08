"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useCreateCompany, useUpdateCompany } from "../../hooks/useCompanyMutations";
import { companyFormSchema, type CompanyFormValues } from "../../schemas/company-form.schema";
import type { Company, CreateCompanyInput } from "../../types";

interface CompanyFormModalProps {
  open: boolean;
  company: Company | null;
  onClose: () => void;
}

function toDefaults(company: Company | null): CompanyFormValues {
  return {
    name: company?.name ?? "",
    profileInfo: company?.profileInfo ?? "",
  };
}

export function CompanyFormModal({ open, company, onClose }: CompanyFormModalProps) {
  const { show } = useToast();
  const isEditing = company !== null;

  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: toDefaults(company),
  });

  useEffect(() => {
    reset(toDefaults(company));
  }, [company, open, reset]);

  function onSubmit(values: CompanyFormValues) {
    const input: CreateCompanyInput = {
      name: values.name,
      profileInfo: values.profileInfo,
    };

    const mutation = isEditing
      ? updateCompany.mutateAsync({ id: company.id, input })
      : createCompany.mutateAsync(input);

    mutation
      .then(() => {
        show(isEditing ? "Company updated." : "Company added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createCompany.isPending || updateCompany.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit company" : "Add company"} widthClassName="max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Company name" htmlFor="company-name" required error={errors.name?.message}>
          <TextInput id="company-name" hasError={!!errors.name} {...register("name")} />
        </FormField>

        <FormField label="Profile info" htmlFor="company-profile-info" error={errors.profileInfo?.message}>
          <textarea
            id="company-profile-info"
            rows={4}
            className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.profileInfo ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
            placeholder="Short description of the company"
            {...register("profileInfo")}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add company"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

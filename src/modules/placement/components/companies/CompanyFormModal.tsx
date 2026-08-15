"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useCreateCompany, useUpdateCompany } from "../../hooks/useCompanyMutations";
import { companyFormSchema, type CompanyFormValues } from "../../schemas/company-form.schema";
import { COMPANY_INDUSTRIES, type Company, type CreateCompanyInput } from "../../types";

interface CompanyFormModalProps {
  open: boolean;
  company: Company | null;
  onClose: () => void;
}

function toDefaults(company: Company | null): CompanyFormValues {
  return {
    name: company?.name ?? "",
    industry: (company?.industry as CompanyFormValues["industry"]) ?? COMPANY_INDUSTRIES[0],
    location: company?.location ?? "",
    recruiterSpoc: company?.recruiterSpoc ?? "",
    expectedPackageLpa: company?.expectedPackageLpa ?? undefined,
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
      industry: values.industry,
      location: values.location,
      recruiterSpoc: values.recruiterSpoc,
      expectedPackageLpa: values.expectedPackageLpa,
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
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit company" : "Add company"}
      subtitle={isEditing ? "Update this recruiter's directory entry." : "Recruiter joins the directory for this cycle."}
      widthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Company name" htmlFor="company-name" required error={errors.name?.message}>
          <TextInput id="company-name" placeholder="e.g. Nference" hasError={!!errors.name} {...register("name")} />
        </FormField>

        <FormField label="Industry" htmlFor="company-industry" error={errors.industry?.message}>
          <SelectInput id="company-industry" hasError={!!errors.industry} {...register("industry")}>
            {COMPANY_INDUSTRIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Location" htmlFor="company-location" error={errors.location?.message}>
          <TextInput
            id="company-location"
            placeholder="e.g. Chennai"
            hasError={!!errors.location}
            {...register("location", textFieldOptions)}
          />
        </FormField>

        <FormField label="Recruiter SPOC" htmlFor="company-spoc" error={errors.recruiterSpoc?.message}>
          <TextInput
            id="company-spoc"
            placeholder="Contact name"
            hasError={!!errors.recruiterSpoc}
            {...register("recruiterSpoc", textFieldOptions)}
          />
        </FormField>

        <FormField
          label="Expected average package in LPA"
          htmlFor="company-package"
          error={errors.expectedPackageLpa?.message}
        >
          <NumberInput
            id="company-package"
            placeholder="e.g. 6.5"
            hasError={!!errors.expectedPackageLpa}
            {...register("expectedPackageLpa", numberFieldOptions)}
          />
        </FormField>

        <FormField label="Profile info" htmlFor="company-profile-info" error={errors.profileInfo?.message}>
          <textarea
            id="company-profile-info"
            rows={3}
            className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.profileInfo ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
            placeholder="Short description of the company"
            {...register("profileInfo", textFieldOptions)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
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

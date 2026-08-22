"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { DatePicker } from "@/shared/components/ui/DatePicker";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useCompanies } from "../../hooks/useCompanies";
import { useCreateCompany } from "../../hooks/useCompanyMutations";
import { useCreateDrive } from "../../hooks/useDriveMutations";
import { driveFormSchema, OTHER_COMPANY_ID, type DriveFormValues } from "../../schemas/drive-form.schema";

const EMPTY_DEFAULTS: DriveFormValues = {
  companyId: 0,
  scheduledDate: "",
  isDisclosed: true,
  disclosedRevealDate: undefined,
  role: undefined,
  packageLpa: undefined,
  eligibilityCgpa: undefined,
  venue: undefined,
  registrationStart: undefined,
  registrationEnd: undefined,
  mode: undefined,
  backlogsAllowed: undefined,
  eligibleDepartmentCodes: undefined,
  round1Label: undefined,
  round2Label: undefined,
  round3Label: undefined,
  resultDeclarationNote: undefined,
};

export function ScheduleDriveForm() {
  const router = useRouter();
  const { show } = useToast();
  const { data: companyPage } = useCompanies({ page_size: 50 });
  const createCompany = useCreateCompany();
  const createDrive = useCreateDrive();
  const [newCompanyName, setNewCompanyName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DriveFormValues>({
    resolver: zodResolver(driveFormSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  const companyId = watch("companyId");
  const isDisclosed = watch("isDisclosed");
  const scheduledDate = watch("scheduledDate");
  const isOtherCompany = companyId === OTHER_COMPANY_ID;
  const currentYear = new Date().getFullYear();

  async function onSubmit(values: DriveFormValues) {
    try {
      let resolvedCompanyId = values.companyId;

      if (resolvedCompanyId === OTHER_COMPANY_ID) {
        const trimmedName = newCompanyName.trim();
        if (!trimmedName) {
          show("Enter the new company's name.", "error");
          return;
        }
        const company = await createCompany.mutateAsync({ name: trimmedName });
        resolvedCompanyId = company.id;
      }

      await createDrive.mutateAsync({ ...values, companyId: resolvedCompanyId });
      show("Drive scheduled.", "success");
      router.push("/placement/drives");
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-slate-200 bg-white p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Company" htmlFor="drive-company" required error={errors.companyId?.message}>
          <div className="flex flex-col gap-2">
            <SelectInput
              id="drive-company"
              hasError={!!errors.companyId}
              value={companyId || ""}
              onChange={(e) => setValue("companyId", Number(e.target.value), { shouldValidate: true })}
            >
              <option value="">Select a company</option>
              {companyPage?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={OTHER_COMPANY_ID}>Other (add new company)</option>
            </SelectInput>
            {isOtherCompany && (
              <TextInput
                placeholder="New company name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
              />
            )}

            <div className="mt-1 flex items-center gap-4 text-sm">
              <label className="flex items-center gap-1.5 font-medium text-slate-700">
                <input
                  type="radio"
                  name="disclosure"
                  checked={isDisclosed}
                  onChange={() => setValue("isDisclosed", true, { shouldValidate: true })}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                Reveal name
              </label>
              <label className="flex items-center gap-1.5 font-medium text-slate-700">
                <input
                  type="radio"
                  name="disclosure"
                  checked={!isDisclosed}
                  onChange={() => setValue("isDisclosed", false, { shouldValidate: true })}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                Hide name
              </label>
            </div>
            <p className="text-xs text-slate-500">
              {isDisclosed
                ? "Students see the company name immediately."
                : "Students see only the company ID until the reveal date below."}
            </p>
          </div>
        </FormField>

        <FormField label="Drive date" htmlFor="drive-date" required error={errors.scheduledDate?.message}>
          <DatePicker
            id="drive-date"
            value={scheduledDate || undefined}
            onChange={(v) => setValue("scheduledDate", v ?? "", { shouldValidate: true })}
            hasError={!!errors.scheduledDate}
            min={`${currentYear}-01-01`}
            max={`${currentYear + 4}-12-31`}
            yearOrder="asc"
          />
        </FormField>

        <FormField label="Job role" htmlFor="drive-role" error={errors.role?.message}>
          <TextInput id="drive-role" hasError={!!errors.role} {...register("role")} />
        </FormField>
        <FormField label="Package (LPA)" htmlFor="drive-package" error={errors.packageLpa?.message}>
          <NumberInput id="drive-package" hasError={!!errors.packageLpa} {...register("packageLpa", numberFieldOptions)} />
        </FormField>
        <FormField label="Eligibility (CGPA)" htmlFor="drive-cgpa" error={errors.eligibilityCgpa?.message}>
          <NumberInput id="drive-cgpa" hasError={!!errors.eligibilityCgpa} {...register("eligibilityCgpa", numberFieldOptions)} />
        </FormField>
        <FormField label="Venue" htmlFor="drive-venue" error={errors.venue?.message}>
          <TextInput id="drive-venue" hasError={!!errors.venue} {...register("venue")} />
        </FormField>
        <FormField label="Registration start" htmlFor="drive-reg-start" error={errors.registrationStart?.message}>
          <DatePicker
            id="drive-reg-start"
            value={watch("registrationStart") || undefined}
            onChange={(v) => setValue("registrationStart", v ?? undefined, { shouldValidate: true })}
            hasError={!!errors.registrationStart}
            min="2020-01-01"
            max="2030-12-31"
          />
        </FormField>
        <FormField label="Registration end" htmlFor="drive-reg-end" error={errors.registrationEnd?.message}>
          <DatePicker
            id="drive-reg-end"
            value={watch("registrationEnd") || undefined}
            onChange={(v) => setValue("registrationEnd", v ?? undefined, { shouldValidate: true })}
            hasError={!!errors.registrationEnd}
            min="2020-01-01"
            max="2030-12-31"
          />
        </FormField>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">Additional details</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Mode" htmlFor="drive-mode" error={errors.mode?.message}>
            <SelectInput
              id="drive-mode"
              hasError={!!errors.mode}
              value={watch("mode") ?? ""}
              onChange={(e) => setValue("mode", (e.target.value || undefined) as DriveFormValues["mode"], { shouldValidate: true })}
            >
              <option value="">Not set</option>
              <option value="on_campus">On campus</option>
              <option value="virtual">Virtual</option>
            </SelectInput>
          </FormField>
          <FormField label="Backlogs allowed" htmlFor="drive-backlogs" error={errors.backlogsAllowed?.message}>
            <TextInput
              id="drive-backlogs"
              placeholder="e.g. None"
              hasError={!!errors.backlogsAllowed}
              {...register("backlogsAllowed", textFieldOptions)}
            />
          </FormField>
          <FormField label="Eligible departments" htmlFor="drive-depts" error={errors.eligibleDepartmentCodes?.message}>
            <TextInput
              id="drive-depts"
              placeholder="e.g. CSE, IT, AIDS"
              hasError={!!errors.eligibleDepartmentCodes}
              {...register("eligibleDepartmentCodes", textFieldOptions)}
            />
          </FormField>
          <FormField label="Result declaration" htmlFor="drive-result-note" error={errors.resultDeclarationNote?.message}>
            <TextInput
              id="drive-result-note"
              placeholder="e.g. Same week as the final round"
              hasError={!!errors.resultDeclarationNote}
              {...register("resultDeclarationNote", textFieldOptions)}
            />
          </FormField>
          <FormField label="Round 1" htmlFor="drive-round1" error={errors.round1Label?.message}>
            <TextInput
              id="drive-round1"
              placeholder="e.g. Online assessment"
              hasError={!!errors.round1Label}
              {...register("round1Label", textFieldOptions)}
            />
          </FormField>
          <FormField label="Round 2" htmlFor="drive-round2" error={errors.round2Label?.message}>
            <TextInput
              id="drive-round2"
              placeholder="e.g. Technical interview"
              hasError={!!errors.round2Label}
              {...register("round2Label", textFieldOptions)}
            />
          </FormField>
          <FormField label="Round 3" htmlFor="drive-round3" error={errors.round3Label?.message}>
            <TextInput
              id="drive-round3"
              placeholder="e.g. HR interview"
              hasError={!!errors.round3Label}
              {...register("round3Label", textFieldOptions)}
            />
          </FormField>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4">
        {!isDisclosed && (
          <FormField
            label="Reveal date"
            htmlFor="drive-reveal-date"
            required
            hint="The company name stays hidden from students until this date — must be before the drive date"
            error={errors.disclosedRevealDate?.message}
          >
            <DatePicker
              id="drive-reveal-date"
              value={watch("disclosedRevealDate") || undefined}
              onChange={(v) => setValue("disclosedRevealDate", v ?? undefined, { shouldValidate: true })}
              hasError={!!errors.disclosedRevealDate}
              min="2020-01-01"
              max="2030-12-31"
            />
          </FormField>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/placement/drives")}
          disabled={createDrive.isPending || createCompany.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" isPending={createDrive.isPending || createCompany.isPending}>
          Schedule drive
        </Button>
      </div>
    </form>
  );
}

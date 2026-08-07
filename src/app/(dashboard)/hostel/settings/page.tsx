"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { useHostelSettings, useUpdateHostelSettings } from "@/modules/hostel/hooks/useHostelSettings";
import {
  hostelSettingsFormSchema,
  type HostelSettingsFormValues,
} from "@/modules/hostel/schemas/settings-form.schema";
import type { HostelSettings } from "@/modules/hostel/types/settings";

function toDefaults(settings: HostelSettings | undefined): HostelSettingsFormValues {
  return {
    auto_approve_low_risk: settings?.auto_approve_low_risk ?? true,
    min_attendance_for_auto_pct: settings?.min_attendance_for_auto_pct,
    require_biometric_pop: settings?.require_biometric_pop ?? false,
    sms_guardian_on_checkout: settings?.sms_guardian_on_checkout ?? true,
    alert_on_overdue_return: settings?.alert_on_overdue_return ?? true,
    weekly_arrears_reminder: settings?.weekly_arrears_reminder ?? true,
    publish_resolved_complaints: settings?.publish_resolved_complaints ?? false,
    max_outing_days: settings?.max_outing_days,
  };
}

interface ToggleFieldProps {
  id: keyof HostelSettingsFormValues;
  label: string;
  hint: string;
  register: ReturnType<typeof useForm<HostelSettingsFormValues>>["register"];
}

function ToggleField({ id, label, hint, register }: ToggleFieldProps) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-slate-200 px-4 py-3">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
        {...register(id)}
      />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        <span className="block text-xs text-slate-500">{hint}</span>
      </span>
    </label>
  );
}

export default function HostelSettingsPage() {
  const { show } = useToast();
  const { data: settings, isLoading, error } = useHostelSettings();
  const updateSettings = useUpdateHostelSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HostelSettingsFormValues>({
    resolver: zodResolver(hostelSettingsFormSchema),
    defaultValues: toDefaults(settings),
  });

  useEffect(() => {
    reset(toDefaults(settings));
  }, [settings, reset]);

  function onSubmit(values: HostelSettingsFormValues) {
    updateSettings.mutate(values, {
      onSuccess: () => show("Hostel settings saved.", "success"),
      onError: (err: unknown) =>
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading settings…</p>;
  }

  if (error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error instanceof ApiError ? error.message : "Failed to load settings."}
      </p>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" description="Hostel policy, approval rules and notifications." />

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-3xl flex-col gap-8">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Approval policy
          </h3>
          <div className="flex flex-col gap-3">
            <ToggleField
              id="auto_approve_low_risk"
              label="Auto-approve low-risk day passes"
              hint="Applies when attendance is above the threshold below and no dues are outstanding"
              register={register}
            />
            <FormField
              label="Minimum attendance % for auto-approval"
              htmlFor="min-attendance"
              required
              error={errors.min_attendance_for_auto_pct?.message}
            >
              <NumberInput
                id="min-attendance"
                hasError={!!errors.min_attendance_for_auto_pct}
                {...register("min_attendance_for_auto_pct", numberFieldOptions)}
              />
            </FormField>
            <ToggleField
              id="require_biometric_pop"
              label="Require biometric proof of presence"
              hint="Otherwise a warden sweep is accepted"
              register={register}
            />
            <FormField
              label="Max outing days"
              htmlFor="max-outing-days"
              required
              error={errors.max_outing_days?.message}
            >
              <NumberInput
                id="max-outing-days"
                hasError={!!errors.max_outing_days}
                {...register("max_outing_days", numberFieldOptions)}
              />
            </FormField>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Notifications
          </h3>
          <div className="flex flex-col gap-3">
            <ToggleField
              id="sms_guardian_on_checkout"
              label="SMS guardian on check-out"
              hint="Sent shortly after the gate scan"
              register={register}
            />
            <ToggleField
              id="alert_on_overdue_return"
              label="Alert me on overdue returns"
              hint="Notify when a resident hasn't returned by their expected time"
              register={register}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Fees and feedback
          </h3>
          <div className="flex flex-col gap-3">
            <ToggleField
              id="weekly_arrears_reminder"
              label="Weekly arrears reminder"
              hint="Sent to students and guardians with outstanding fees"
              register={register}
            />
            <ToggleField
              id="publish_resolved_complaints"
              label="Publish resolved complaints"
              hint="Visible on the resident notice board"
              register={register}
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isPending={updateSettings.isPending}>
            Save settings
          </Button>
        </div>
      </form>
    </div>
  );
}

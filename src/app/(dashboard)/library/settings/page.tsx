"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useLibrarySettings, useUpdateLibrarySettings } from "@/modules/library/hooks/useLibrarySettings";
import { settingsFormSchema, type SettingsFormValues } from "@/modules/library/schemas/settings-form.schema";
import type { LibrarySettings } from "@/modules/library/types/settings";

function toDefaults(settings: LibrarySettings | undefined): SettingsFormValues {
  return {
    books_per_student: settings?.books_per_student,
    default_borrowing_days: settings?.default_borrowing_days,
    max_renewals: settings?.max_renewals,
    renewal_extension_days: settings?.renewal_extension_days,
    fine_per_day: settings?.fine_per_day,
    lost_book_processing_fee: settings?.lost_book_processing_fee,
    damaged_book_charge_rate: settings?.damaged_book_charge_rate,
    grace_period_days: settings?.grace_period_days,
    block_issue_above_fine: settings?.block_issue_above_fine,
    barcode_format: settings?.barcode_format ?? undefined,
    spine_label_prefix: settings?.spine_label_prefix ?? undefined,
    counter_opens_at: settings?.counter_opens_at ?? undefined,
    counter_closes_at: settings?.counter_closes_at ?? undefined,
  };
}

export default function LibrarySettingsPage() {
  const { show } = useToast();
  const { data: settings, isLoading, error } = useLibrarySettings();
  const updateSettings = useUpdateLibrarySettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: toDefaults(settings),
  });

  useEffect(() => {
    reset(toDefaults(settings));
  }, [settings, reset]);

  function onSubmit(values: SettingsFormValues) {
    updateSettings.mutate(values, {
      onSuccess: () => show("Library settings saved.", "success"),
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
      <PageHeader
        title="Settings"
        description="Borrowing rules, fines, classification, and counter hours."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 max-w-3xl">
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Borrowing rules
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Books per student"
              htmlFor="books-per-student"
              required
              error={errors.books_per_student?.message}
            >
              <NumberInput
                id="books-per-student"
                hasError={!!errors.books_per_student}
                {...register("books_per_student", numberFieldOptions)}
              />
            </FormField>
            <FormField
              label="Default borrowing days"
              htmlFor="default-borrowing-days"
              required
              error={errors.default_borrowing_days?.message}
            >
              <NumberInput
                id="default-borrowing-days"
                hasError={!!errors.default_borrowing_days}
                {...register("default_borrowing_days", numberFieldOptions)}
              />
            </FormField>
            <FormField
              label="Max renewals"
              htmlFor="max-renewals"
              required
              error={errors.max_renewals?.message}
            >
              <NumberInput
                id="max-renewals"
                hasError={!!errors.max_renewals}
                {...register("max_renewals", numberFieldOptions)}
              />
            </FormField>
            <FormField
              label="Renewal extension days"
              htmlFor="renewal-extension-days"
              required
              error={errors.renewal_extension_days?.message}
            >
              <NumberInput
                id="renewal-extension-days"
                hasError={!!errors.renewal_extension_days}
                {...register("renewal_extension_days", numberFieldOptions)}
              />
            </FormField>
            <FormField
              label="Grace period days"
              htmlFor="grace-period-days"
              required
              error={errors.grace_period_days?.message}
            >
              <NumberInput
                id="grace-period-days"
                hasError={!!errors.grace_period_days}
                {...register("grace_period_days", numberFieldOptions)}
              />
            </FormField>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Fines
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Fine per day (₹)"
              htmlFor="fine-per-day"
              required
              error={errors.fine_per_day?.message}
            >
              <NumberInput
                id="fine-per-day"
                hasError={!!errors.fine_per_day}
                {...register("fine_per_day", numberFieldOptions)}
              />
            </FormField>
            <FormField
              label="Block issue above fine (₹)"
              htmlFor="block-issue-above-fine"
              required
              hint="Students with unpaid fines above this amount can't borrow more books"
              error={errors.block_issue_above_fine?.message}
            >
              <NumberInput
                id="block-issue-above-fine"
                hasError={!!errors.block_issue_above_fine}
                {...register("block_issue_above_fine", numberFieldOptions)}
              />
            </FormField>
            <FormField
              label="Lost book processing fee (₹)"
              htmlFor="lost-book-fee"
              required
              error={errors.lost_book_processing_fee?.message}
            >
              <NumberInput
                id="lost-book-fee"
                hasError={!!errors.lost_book_processing_fee}
                {...register("lost_book_processing_fee", numberFieldOptions)}
              />
            </FormField>
            <FormField
              label="Damaged book charge rate"
              htmlFor="damaged-book-rate"
              required
              hint="Fraction of the book's price, 0–1 (e.g. 0.4 = 40%)"
              error={errors.damaged_book_charge_rate?.message}
            >
              <NumberInput
                id="damaged-book-rate"
                hasError={!!errors.damaged_book_charge_rate}
                {...register("damaged_book_charge_rate", numberFieldOptions)}
              />
            </FormField>
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Classification & counter
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Barcode format" htmlFor="barcode-format" error={errors.barcode_format?.message}>
              <TextInput
                id="barcode-format"
                hasError={!!errors.barcode_format}
                {...register("barcode_format", textFieldOptions)}
              />
            </FormField>
            <FormField
              label="Spine label prefix"
              htmlFor="spine-label-prefix"
              error={errors.spine_label_prefix?.message}
            >
              <TextInput
                id="spine-label-prefix"
                hasError={!!errors.spine_label_prefix}
                {...register("spine_label_prefix", textFieldOptions)}
              />
            </FormField>
            <FormField label="Counter opens at" htmlFor="counter-opens-at" error={errors.counter_opens_at?.message}>
              <TextInput
                id="counter-opens-at"
                type="time"
                hasError={!!errors.counter_opens_at}
                {...register("counter_opens_at", textFieldOptions)}
              />
            </FormField>
            <FormField
              label="Counter closes at"
              htmlFor="counter-closes-at"
              error={errors.counter_closes_at?.message}
            >
              <TextInput
                id="counter-closes-at"
                type="time"
                hasError={!!errors.counter_closes_at}
                {...register("counter_closes_at", textFieldOptions)}
              />
            </FormField>
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

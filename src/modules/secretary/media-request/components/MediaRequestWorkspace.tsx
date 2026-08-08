"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/Button";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { BellIcon, CheckIcon, FileTextIcon, HistoryIcon } from "@/shared/components/icons";
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { SecretaryField } from "@/modules/secretary/components/SecretaryField";
import { RequestHistoryTable, type HistoryRow } from "@/modules/secretary/components/RequestHistoryTable";
import { useVenueOptions } from "../hooks/useVenueOptions";
import { useDeleteMediaRequest, useCreateMediaRequest, useMediaRequests } from "../hooks/useMediaRequests";
import {
  mediaRequestFormSchema,
  type MediaRequestFormValues,
} from "../schemas/media-request-form.schema";
import { MEDIA_REQUEST_TYPES, type MediaRequest } from "../types";

const DEFAULTS: MediaRequestFormValues = {
  event_name: "",
  event_date: "",
  venue_id: undefined,
  coordinator_name: "",
  contact_number: "",
  media_types: [],
  description: "",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function MediaRequestWorkspace() {
  const [view, setView] = useState<"compose" | "history">("compose");
  const [deleteTarget, setDeleteTarget] = useState<MediaRequest | null>(null);
  const { show } = useToast();

  const { data: venuesResult } = useVenueOptions();
  const { data, isLoading } = useMediaRequests();
  const requests = data?.data ?? [];
  const createRequest = useCreateMediaRequest();
  const deleteRequest = useDeleteMediaRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MediaRequestFormValues>({
    resolver: zodResolver(mediaRequestFormSchema),
    defaultValues: DEFAULTS,
  });

  const historyRows: HistoryRow[] = useMemo(
    () =>
      requests
        .slice()
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .map((r) => ({
          id: r.id,
          title: r.event_name ?? r.description,
          date: formatDate(r.created_at),
          status: r.status,
          editable: r.status === "pending",
        })),
    [requests],
  );

  function onSubmit(values: MediaRequestFormValues) {
    createRequest.mutate(
      {
        description: values.description,
        event_name: values.event_name?.trim() || undefined,
        event_date: values.event_date || undefined,
        venue_id: values.venue_id,
        coordinator_name: values.coordinator_name?.trim() || undefined,
        contact_number: values.contact_number?.trim() || undefined,
        media_types: values.media_types.length > 0 ? values.media_types : undefined,
      },
      {
        onSuccess: () => {
          show("Submitted for approval.", "success");
          reset(DEFAULTS);
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteRequest.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Request withdrawn.", "success");
        setDeleteTarget(null);
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  if (view === "history") {
    return (
      <>
        <RequestHistoryTable
          title="Media Requests"
          subtitle="Previous media requests and status"
          columnLabel="Event"
          rows={historyRows}
          emptyMessage={isLoading ? "Loading…" : "No media requests yet."}
          onBack={() => setView("compose")}
          onDelete={(id) => setDeleteTarget(requests.find((r) => r.id === id) ?? null)}
        />
        <ConfirmDialog
          open={deleteTarget !== null}
          title="Withdraw request"
          message={`Withdraw the media request "${deleteTarget?.event_name ?? deleteTarget?.description}"?`}
          confirmLabel="Withdraw"
          tone="danger"
          isPending={deleteRequest.isPending}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-6 flex items-center gap-3.5">
        <div className="flex-1 text-center">
          <div className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">Media Request</div>
        </div>
        <button
          onClick={() => setView("history")}
          className="flex items-center gap-[7px] rounded-[10px] border border-[#E3E8EF] px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <HistoryIcon className="h-4 w-4" /> History
        </button>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E3E8EF] text-slate-500"
          title="Notifications"
          type="button"
        >
          <BellIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
            <FileTextIcon className="h-[17px] w-[17px] text-blue-600" />
            <p className="text-[15.5px] font-semibold text-slate-900">Request Details</p>
          </div>
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
            <SecretaryField label="Event Name" error={errors.event_name?.message}>
              <TextInput placeholder="e.g. National Level Symposium" {...register("event_name")} />
            </SecretaryField>
            <SecretaryField label="Event Date" error={errors.event_date?.message}>
              <TextInput type="date" {...register("event_date")} />
            </SecretaryField>
            <SecretaryField label="Venue" error={errors.venue_id?.message}>
              <SelectInput {...register("venue_id", numberFieldOptions)}>
                <option value="">Select venue</option>
                {venuesResult?.data.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </SelectInput>
            </SecretaryField>
            <SecretaryField label="Event Coordinator" error={errors.coordinator_name?.message}>
              <TextInput placeholder="Coordinator name" {...register("coordinator_name")} />
            </SecretaryField>
            <SecretaryField label="Contact Number" error={errors.contact_number?.message}>
              <TextInput type="tel" placeholder="+91 00000 00000" {...register("contact_number")} />
            </SecretaryField>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
            <CheckIcon className="h-[17px] w-[17px] text-blue-600" />
            <p className="text-[15.5px] font-semibold text-slate-900">Media Requirement</p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
            {MEDIA_REQUEST_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2.5 rounded-[14px] border border-slate-300 px-3.5 py-3 text-[14.5px] text-slate-700 hover:border-blue-300 hover:bg-blue-50"
              >
                <input
                  type="checkbox"
                  value={type}
                  className="h-4 w-4 accent-blue-600"
                  {...register("media_types")}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
            <FileTextIcon className="h-[17px] w-[17px] text-blue-600" />
            <p className="text-[15.5px] font-semibold text-slate-900">Purpose</p>
          </div>
          <div className="p-5">
            <textarea
              rows={4}
              placeholder="Briefly describe the event and media requirements."
              className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                errors.description ? "border-red-300 focus:border-red-500" : "border-[#E3E8EF] focus:border-blue-600"
              }`}
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Button type="submit" variant="primary" isPending={createRequest.isPending}>
            Submit for Approval
          </Button>
        </div>
      </form>
    </div>
  );
}

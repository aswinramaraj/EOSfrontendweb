"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/Button";
import { TextInput } from "@/shared/components/ui/TextInput";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { BellIcon, FileTextIcon, HistoryIcon, PlusIcon, TrashIcon } from "@/shared/components/icons";
import { SecretaryField } from "@/modules/secretary/components/SecretaryField";
import { ItemNameSelect } from "@/modules/secretary/components/ItemNameSelect";
import { RequestHistoryTable, type HistoryRow } from "@/modules/secretary/components/RequestHistoryTable";
import {
  useCreateServiceRequest,
  useDeleteServiceRequest,
  useServiceRequests,
  useSubmitServiceRequest,
  useUpdateServiceRequest,
} from "../hooks/useServiceRequests";
import {
  serviceRequestFormSchema,
  type ServiceRequestFormValues,
} from "../schemas/service-request-form.schema";
import type { ServiceRequest } from "../types/service-request";

const SERVICE_OPTIONS = [
  "Annual AC servicing",
  "Network cabling audit",
  "Housekeeping and deep cleaning",
  "Electrical maintenance",
  "Lab equipment calibration",
  "Water purifier servicing",
] as const;

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function toDefaults(request: ServiceRequest | null): ServiceRequestFormValues {
  return {
    title: request?.title ?? "",
    justification: request?.justification ?? "",
    items: request?.items.map((item) => ({ service_name: item.service_name })) ?? [
      { service_name: "" },
      { service_name: "" },
    ],
  };
}

export function ServiceRequestsPanel() {
  const [view, setView] = useState<"compose" | "history">("compose");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRequest | null>(null);
  const { show } = useToast();

  const { data, isLoading } = useServiceRequests();
  const requests = data?.data ?? [];
  const editing = editingId ? requests.find((r) => r.id === editingId) ?? null : null;

  const createRequest = useCreateServiceRequest();
  const updateRequest = useUpdateServiceRequest();
  const submitRequest = useSubmitServiceRequest();
  const deleteRequest = useDeleteServiceRequest();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestFormSchema),
    defaultValues: toDefaults(null),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  useEffect(() => {
    if (view === "compose") reset(toDefaults(editing));
  }, [editing, view, reset]);

  const historyRows: HistoryRow[] = useMemo(
    () =>
      requests
        .slice()
        .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
        .map((r) => ({
          id: r.id,
          title: r.title,
          date: formatDate(r.created_at),
          status: r.status,
          editable: r.status === "draft",
        })),
    [requests],
  );

  function buildPayload(values: ServiceRequestFormValues) {
    const items = values.items
      .map((item) => ({ service_name: item.service_name.trim() }))
      .filter((item) => item.service_name.length > 0);
    return {
      title: values.title,
      justification: values.justification?.trim() || undefined,
      ...(items.length > 0 && { items }),
    };
  }

  function startNew() {
    setEditingId(null);
    reset(toDefaults(null));
    setView("compose");
  }

  function saveDraft(values: ServiceRequestFormValues) {
    const payload = buildPayload(values);
    const mutation = editing
      ? updateRequest.mutateAsync({ id: editing.id, input: payload })
      : createRequest.mutateAsync(payload);

    mutation
      .then(() => {
        show("Draft saved.", "success");
        startNew();
      })
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  async function submitForApproval(values: ServiceRequestFormValues) {
    const payload = buildPayload(values);
    if (!payload.items || payload.items.length === 0) {
      show("Add at least one service before submitting.", "error");
      return;
    }
    try {
      const saved = editing
        ? await updateRequest.mutateAsync({ id: editing.id, input: payload })
        : await createRequest.mutateAsync(payload);
      await submitRequest.mutateAsync(saved.id);
      show("Submitted for approval.", "success");
      startNew();
    } catch (err) {
      show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
    }
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteRequest.mutate(deleteTarget.id, {
      onSuccess: () => {
        show("Draft deleted.", "success");
        setDeleteTarget(null);
        if (editingId === deleteTarget.id) startNew();
      },
      onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"),
    });
  }

  const isPending = createRequest.isPending || updateRequest.isPending || submitRequest.isPending;

  if (view === "history") {
    return (
      <>
        <RequestHistoryTable
          title="Service Order Proposals"
          subtitle="Previous service requests and status"
          columnLabel="Title"
          rows={historyRows}
          emptyMessage={isLoading ? "Loading…" : "No service requests yet."}
          onBack={() => setView("compose")}
          onEdit={(id) => {
            setEditingId(id);
            setView("compose");
          }}
          onDelete={(id) => setDeleteTarget(requests.find((r) => r.id === id) ?? null)}
        />
        <ConfirmDialog
          open={deleteTarget !== null}
          title="Delete draft"
          message={`Delete draft "${deleteTarget?.title}"? This can't be undone.`}
          confirmLabel="Delete"
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
          <div className="text-2xl font-semibold tracking-[-0.02em] text-slate-900">
            {editing ? "Edit Service Order Proposal" : "Service Order Proposal"}
          </div>
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

      <form className="flex flex-col gap-5">
        <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-[10px] border-b border-[#E3E8EF] px-5 py-4">
            <FileTextIcon className="h-[17px] w-[17px] text-blue-600" />
            <p className="text-[15.5px] font-semibold text-slate-900">Proposal Details</p>
          </div>
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
            <SecretaryField label="Proposal Title" error={errors.title?.message}>
              <TextInput
                placeholder="e.g. Annual Lab Maintenance Request 2026"
                hasError={!!errors.title}
                {...register("title")}
              />
            </SecretaryField>
            <SecretaryField label="Purpose / Justification">
              <textarea
                rows={3}
                placeholder="Describe the purpose and justification for this service order proposal..."
                className="w-full rounded-md border border-[#E3E8EF] px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
                {...register("justification")}
              />
            </SecretaryField>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3.5 border-b border-[#E3E8EF] px-5 py-3.5">
            <div className="flex items-center gap-[10px]">
              <PlusIcon className="h-[17px] w-[17px] text-blue-600" />
              <span className="text-[15.5px] font-semibold text-slate-900">Services</span>
            </div>
            <button
              type="button"
              onClick={() => append({ service_name: "" })}
              className="flex items-center gap-1.5 rounded-[10px] border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Add Service
            </button>
          </div>
          <div className="px-5 pb-[18px]">
            <div className="hidden grid-cols-[1fr_44px] gap-3 border-b border-slate-200 pb-2 pt-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-600 sm:grid">
              <span>Service Name</span>
              <span />
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 items-start gap-3 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[1fr_44px]"
              >
                <ItemNameSelect
                  value={watch(`items.${index}.service_name`) ?? ""}
                  onChange={(v) => setValue(`items.${index}.service_name`, v, { shouldValidate: true })}
                  options={SERVICE_OPTIONS}
                  placeholder="Select service"
                  hasError={!!errors.items?.[index]?.service_name}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E3E8EF] text-slate-400 hover:text-red-600"
                  aria-label="Remove service"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            {fields.length === 0 && <p className="py-3 text-sm text-slate-500">No services added yet.</p>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <Button
            type="button"
            variant="secondary"
            onClick={handleSubmit(saveDraft)}
            isPending={createRequest.isPending || updateRequest.isPending}
            disabled={isPending}
          >
            Save Draft
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit(submitForApproval)}
            isPending={submitRequest.isPending}
            disabled={isPending}
          >
            Submit for Approval
          </Button>
        </div>
      </form>
    </div>
  );
}

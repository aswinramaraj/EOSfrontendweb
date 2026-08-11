"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { AlertTriangleIcon } from "@/shared/components/icons";
import { useHrRequests, useDeleteHrVacationEntry } from "@/modules/hr/hooks/useHrRequests";
import { useMarkFacultyAttendance } from "../hooks/useFacultyMutations";
import { markAttendanceFormSchema, type MarkAttendanceFormValues } from "../schemas/mark-attendance-form.schema";

const STATUS_OPTIONS: { value: MarkAttendanceFormValues["status"]; label: string }[] = [
  { value: "full_day", label: "Full Day" },
  { value: "half_day", label: "Half Day" },
  { value: "absent", label: "Absent" },
  { value: "on_duty", label: "On Duty" },
  { value: "on_leave", label: "On Leave" },
  { value: "weekly_off", label: "Weekly Off" },
  { value: "holiday", label: "Holiday" },
];

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export interface MarkAttendanceInitialValues {
  date: string;
  status?: MarkAttendanceFormValues["status"];
  punch_in?: string | null;
  punch_out?: string | null;
}

interface MarkAttendanceModalProps {
  open: boolean;
  facultyId: number;
  facultyName: string;
  initial: MarkAttendanceInitialValues | null;
  onClose: () => void;
}

export function MarkAttendanceModal({ open, facultyId, facultyName, initial, onClose }: MarkAttendanceModalProps) {
  const { show } = useToast();
  const markAttendance = useMarkFacultyAttendance();
  const cancelEntry = useDeleteHrVacationEntry();

  // Approved leave/OD lives entirely separately from faculty_daily_attendance
  // — marking someone "Full Day" here doesn't touch it, so without this check
  // HR could correct a day's attendance while an approved Leave/OD for that
  // same day silently keeps showing as if they were away, out of sync with
  // what actually happened.
  const { data: approvedRequests } = useHrRequests({ faculty_id: facultyId, status: "approved", limit: 50 });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MarkAttendanceFormValues>({
    resolver: zodResolver(markAttendanceFormSchema),
    defaultValues: {
      date: initial?.date ?? todayIso(),
      status: initial?.status ?? "full_day",
      punch_in: initial?.punch_in ?? "",
      punch_out: initial?.punch_out ?? "",
    },
  });

  useEffect(() => {
    reset({
      date: initial?.date ?? todayIso(),
      status: initial?.status ?? "full_day",
      punch_in: initial?.punch_in ?? "",
      punch_out: initial?.punch_out ?? "",
    });
  }, [initial, open, reset]);

  const selectedDate = watch("date");
  const conflictingRequest = useMemo(() => {
    if (!selectedDate) return null;
    return (approvedRequests?.data ?? []).find(
      (r) => selectedDate >= r.from_date.slice(0, 10) && selectedDate <= r.to_date.slice(0, 10),
    );
  }, [approvedRequests, selectedDate]);

  function handleCancelConflict() {
    if (!conflictingRequest) return;
    cancelEntry.mutate(
      { kind: conflictingRequest.kind, sourceId: conflictingRequest.source_id },
      {
        onSuccess: () =>
          show(`${conflictingRequest.kind === "leave" ? "Leave" : "OD"} cancelled.`, "success"),
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to cancel this request.", "error"),
      },
    );
  }

  function onSubmit(values: MarkAttendanceFormValues) {
    markAttendance.mutate(
      {
        id: facultyId,
        date: values.date,
        input: {
          status: values.status,
          punch_in: values.punch_in || undefined,
          punch_out: values.punch_out || undefined,
        },
      },
      {
        onSuccess: () => {
          show("Attendance saved.", "success");
          onClose();
        },
        onError: (err: unknown) => show(err instanceof ApiError ? err.message : "Failed to save attendance.", "error"),
      },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Mark attendance" subtitle={facultyName}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {conflictingRequest && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
            <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p>
                {facultyName} has an approved {conflictingRequest.kind === "leave" ? "Leave" : "OD"} covering this
                date. If they actually came in, cancel it so attendance and requests stay consistent.
              </p>
              <button
                type="button"
                onClick={handleCancelConflict}
                disabled={cancelEntry.isPending}
                className="mt-1.5 font-semibold text-amber-900 underline hover:no-underline disabled:opacity-50"
              >
                Cancel this {conflictingRequest.kind === "leave" ? "Leave" : "OD"}
              </button>
            </div>
          </div>
        )}

        <FormField label="Date" htmlFor="attendance-date" required error={errors.date?.message}>
          <TextInput id="attendance-date" type="date" hasError={!!errors.date} {...register("date")} />
        </FormField>

        <FormField label="Status" htmlFor="attendance-status" required error={errors.status?.message}>
          <SelectInput id="attendance-status" hasError={!!errors.status} {...register("status")}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Punch in" htmlFor="attendance-punch-in" hint="Optional" error={errors.punch_in?.message}>
            <TextInput id="attendance-punch-in" type="time" hasError={!!errors.punch_in} {...register("punch_in")} />
          </FormField>
          <FormField label="Punch out" htmlFor="attendance-punch-out" hint="Optional" error={errors.punch_out?.message}>
            <TextInput id="attendance-punch-out" type="time" hasError={!!errors.punch_out} {...register("punch_out")} />
          </FormField>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={markAttendance.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={markAttendance.isPending}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

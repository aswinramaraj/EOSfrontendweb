"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { AlertTriangleIcon } from "@/shared/components/icons";
import { useMarkFacultyAttendance } from "@/modules/faculty/hooks/useFacultyMutations";
import { markAttendanceFormSchema, type MarkAttendanceFormValues } from "@/modules/faculty/schemas/mark-attendance-form.schema";
import { useHrRequests, useDeleteHrVacationEntry } from "../hooks/useHrRequests";

const STATUS_OPTIONS: { value: MarkAttendanceFormValues["status"]; label: string }[] = [
  { value: "full_day", label: "Full Day" },
  { value: "half_day", label: "Half Day" },
  { value: "absent", label: "Absent" },
  { value: "on_duty", label: "On Duty" },
  { value: "on_leave", label: "On Leave" },
  { value: "weekly_off", label: "Weekly Off" },
  { value: "holiday", label: "Holiday" },
];

const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

interface BulkFormValues {
  date: string;
  status: MarkAttendanceFormValues["status"];
}

export interface BulkAttendanceFaculty {
  id: number;
  name: string;
  /** Already has a faculty_daily_attendance row for today — bulk-marking
   *  them again for today would silently overwrite whatever that already is
   *  (e.g. a leave someone recorded this morning) unless HR reconfirms it. */
  hasExistingToday: boolean;
}

interface PendingOverwrite {
  values: BulkFormValues;
  flagged: BulkAttendanceFaculty[];
  fresh: BulkAttendanceFaculty[];
}

interface BulkMarkAttendanceModalProps {
  open: boolean;
  faculty: BulkAttendanceFaculty[];
  onClose: () => void;
  onDone: () => void;
}

// One status + one date applied to every selected faculty member in a single
// pass — punch in/out are deliberately left out here (unlike the per-faculty
// modal): a bulk action is for exception cases like "mark this whole list on
// leave," where individual punch times don't apply anyway.
export function BulkMarkAttendanceModal({ open, faculty, onClose, onDone }: BulkMarkAttendanceModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Mark attendance" subtitle={`${faculty.length} faculty selected`}>
      {/* Keyed by open/closed so every time this reopens it's a fresh mount —
          form values and the overwrite-confirmation step both reset for free
          instead of needing an effect to reset them. */}
      <BulkMarkAttendanceModalBody key={open ? "open" : "closed"} faculty={faculty} onClose={onClose} onDone={onDone} />
    </Modal>
  );
}

interface BulkMarkAttendanceModalBodyProps {
  faculty: BulkAttendanceFaculty[];
  onClose: () => void;
  onDone: () => void;
}

function BulkMarkAttendanceModalBody({ faculty, onClose, onDone }: BulkMarkAttendanceModalBodyProps) {
  const { show } = useToast();
  const markAttendance = useMarkFacultyAttendance();
  const cancelEntry = useDeleteHrVacationEntry();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOverwrite, setPendingOverwrite] = useState<PendingOverwrite | null>(null);

  // Fetched broadly (not per-faculty) and filtered client-side against the
  // selected faculty — same reasoning as the single-faculty modal: approved
  // leave/OD lives separately from faculty_daily_attendance, so bulk-marking
  // someone present here doesn't touch it unless HR is shown the conflict.
  const { data: approvedRequests } = useHrRequests({ status: "approved", limit: 100 });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BulkFormValues>({
    resolver: zodResolver(markAttendanceFormSchema.pick({ date: true, status: true })),
    defaultValues: { date: todayIso(), status: "full_day" },
  });

  const selectedDate = watch("date");
  const selectedIds = useMemo(() => new Set(faculty.map((f) => f.id)), [faculty]);
  const conflicts = useMemo(() => {
    if (!selectedDate) return [];
    return (approvedRequests?.data ?? []).filter(
      (r) =>
        selectedIds.has(r.faculty.id) &&
        selectedDate >= r.from_date.slice(0, 10) &&
        selectedDate <= r.to_date.slice(0, 10),
    );
  }, [approvedRequests, selectedIds, selectedDate]);

  async function performSubmit(list: BulkAttendanceFaculty[], values: BulkFormValues) {
    setIsSubmitting(true);
    const results = await Promise.allSettled(
      list.map((f) => markAttendance.mutateAsync({ id: f.id, date: values.date, input: { status: values.status } })),
    );
    setIsSubmitting(false);

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      show(`Marked ${list.length} faculty as ${STATUS_LABEL[values.status]}.`, "success");
    } else if (failed === list.length) {
      show(`Failed to mark attendance for all ${list.length} faculty.`, "error");
    } else {
      show(`Marked ${list.length - failed} of ${list.length} faculty — ${failed} failed.`, "info");
    }
    onDone();
    onClose();
  }

  async function handleCancelConflicts() {
    const results = await Promise.allSettled(
      conflicts.map((r) => cancelEntry.mutateAsync({ kind: r.kind, sourceId: r.source_id })),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      show(`Cancelled ${conflicts.length} conflicting request${conflicts.length === 1 ? "" : "s"}.`, "success");
    } else {
      show(`Cancelled ${conflicts.length - failed} of ${conflicts.length} — ${failed} failed.`, "info");
    }
  }

  async function onSubmit(values: BulkFormValues) {
    if (values.date === todayIso()) {
      const flagged = faculty.filter((f) => f.hasExistingToday);
      if (flagged.length > 0) {
        setPendingOverwrite({ values, flagged, fresh: faculty.filter((f) => !f.hasExistingToday) });
        return;
      }
    }
    await performSubmit(faculty, values);
  }

  if (pendingOverwrite) {
    const { values, flagged, fresh } = pendingOverwrite;
    return (
      <div className="flex flex-col gap-4">
        <h4 className="text-sm font-bold text-slate-900">Confirm overwrite</h4>
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            These faculty already have today&apos;s attendance recorded. Marking them as{" "}
            <strong>{STATUS_LABEL[values.status]}</strong> will overwrite their existing status.
          </p>
        </div>

        <div className="max-h-32 overflow-y-auto rounded-md border border-slate-100 bg-slate-50 p-2">
          <div className="flex flex-wrap gap-1.5">
            {flagged.map((f) => (
              <span key={f.id} className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-xs text-amber-700">
                {f.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={() => setPendingOverwrite(null)} disabled={isSubmitting}>
            Back
          </Button>
          {fresh.length > 0 && (
            <Button type="button" variant="secondary" isPending={isSubmitting} onClick={() => performSubmit(fresh, values)}>
              Skip these, mark other {fresh.length}
            </Button>
          )}
          <Button type="button" variant="primary" isPending={isSubmitting} onClick={() => performSubmit(faculty, values)}>
            Overwrite all {faculty.length}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="max-h-28 overflow-y-auto rounded-md border border-slate-100 bg-slate-50 p-2">
        <div className="flex flex-wrap gap-1.5">
          {faculty.map((f) => (
            <span key={f.id} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">
              {f.name}
            </span>
          ))}
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="flex-1">
            <p>
              {conflicts.length} of the selected faculty have an approved Leave/OD covering{" "}
              {selectedDate || "this date"}. If they actually came in, cancel those so attendance and requests stay
              consistent.
            </p>
            <button
              type="button"
              onClick={handleCancelConflicts}
              disabled={cancelEntry.isPending}
              className="mt-1.5 font-semibold text-amber-900 underline hover:no-underline disabled:opacity-50"
            >
              Cancel {conflicts.length} conflicting request{conflicts.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}

      <FormField label="Date" htmlFor="bulk-attendance-date" required error={errors.date?.message}>
        <TextInput id="bulk-attendance-date" type="date" hasError={!!errors.date} {...register("date")} />
      </FormField>

      <FormField label="Status" htmlFor="bulk-attendance-status" required error={errors.status?.message}>
        <SelectInput id="bulk-attendance-status" hasError={!!errors.status} {...register("status")}>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isPending={isSubmitting}>
          Mark {faculty.length} Faculty
        </Button>
      </div>
    </form>
  );
}

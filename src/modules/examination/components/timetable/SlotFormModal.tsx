"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { useSubjects } from "@/modules/subjects/hooks/useSubjects";
import { useClasses } from "@/modules/classes/hooks/useClasses";
import { useAllVenues } from "@/modules/venues/hooks/useVenues";
import { useExamSubjectMappings } from "../../hooks/useExamSubjectMapping";
import {
  useCreateTimetableSlot,
  useUpdateTimetableSlot,
} from "../../hooks/useTimetableVersionMutations";
import {
  timetableSlotFormSchema,
  type TimetableSlotFormValues,
} from "../../schemas/timetable-slot-form.schema";
import type { TimetableSlot } from "../../types/exam-timetable-versions";

// start_time/end_time come back as full ISO datetimes on a 1970-01-01
// placeholder date — only the HH:mm portion at [11,16) is meaningful.
function toHm(isoTime: string): string {
  return isoTime.includes("T") ? isoTime.slice(11, 16) : isoTime.slice(0, 5);
}

interface SlotFormModalProps {
  open: boolean;
  versionId: number;
  examId: number;
  scheduledMappingIds: number[];
  slot: TimetableSlot | null;
  onClose: () => void;
}

function toDefaults(slot: TimetableSlot | null): TimetableSlotFormValues {
  return {
    exam_subject_mapping_id: slot?.exam_subject_mapping_id,
    exam_date: slot?.exam_date.slice(0, 10) ?? "",
    session: slot?.session ?? "FN",
    start_time: slot ? toHm(slot.start_time) : "09:30",
    end_time: slot ? toHm(slot.end_time) : "12:30",
    venue_id: slot?.venue_id ?? undefined,
  };
}

export function SlotFormModal({
  open,
  versionId,
  examId,
  scheduledMappingIds,
  slot,
  onClose,
}: SlotFormModalProps) {
  const { show } = useToast();
  const isEditing = slot !== null;

  const { data: mappings } = useExamSubjectMappings();
  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses();
  const { data: venuePage } = useAllVenues();

  const createSlot = useCreateTimetableSlot();
  const updateSlot = useUpdateTimetableSlot();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TimetableSlotFormValues>({
    resolver: zodResolver(timetableSlotFormSchema),
    defaultValues: toDefaults(slot),
  });

  useEffect(() => {
    reset(toDefaults(slot));
  }, [slot, open, reset]);

  const availableMappings = (mappings ?? []).filter(
    (m) =>
      m.exam_id === examId &&
      (!scheduledMappingIds.includes(m.id) || m.id === slot?.exam_subject_mapping_id),
  );

  function mappingLabel(mappingId: number) {
    const mapping = (mappings ?? []).find((m) => m.id === mappingId);
    if (!mapping) return `#${mappingId}`;
    const subject = subjects?.find((s) => s.id === mapping.subject_id);
    const cls = classes?.find((c) => c.id === mapping.class_id);
    return `${subject?.subject_code ?? "?"} · ${subject?.name ?? "Unknown subject"} — ${cls?.section ? `Section ${cls.section}` : ""}${mapping.is_elective ? " (elective)" : ""}`;
  }

  function onSubmit(values: TimetableSlotFormValues) {
    const mutation = isEditing
      ? updateSlot.mutateAsync({
          id: slot.id,
          input: {
            exam_date: values.exam_date,
            session: values.session,
            start_time: values.start_time,
            end_time: values.end_time,
            venue_id: values.venue_id,
          },
        })
      : createSlot.mutateAsync({
          version_id: versionId,
          exam_subject_mapping_id: values.exam_subject_mapping_id!,
          exam_date: values.exam_date,
          session: values.session,
          start_time: values.start_time,
          end_time: values.end_time,
          venue_id: values.venue_id,
        });

    mutation
      .then(() => {
        show(isEditing ? "Slot updated." : "Paper scheduled.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createSlot.isPending || updateSlot.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit scheduled slot" : "Schedule a paper"}
      widthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label="Paper"
          htmlFor="slot-mapping"
          required
          error={errors.exam_subject_mapping_id?.message}
        >
          <SelectInput
            id="slot-mapping"
            hasError={!!errors.exam_subject_mapping_id}
            disabled={isEditing}
            {...register("exam_subject_mapping_id", numberFieldOptions)}
          >
            <option value="">Select a paper</option>
            {availableMappings.map((m) => (
              <option key={m.id} value={m.id}>
                {mappingLabel(m.id)}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date" htmlFor="slot-date" required error={errors.exam_date?.message}>
            <TextInput id="slot-date" type="date" hasError={!!errors.exam_date} {...register("exam_date")} />
          </FormField>
          <FormField label="Session" htmlFor="slot-session" error={errors.session?.message}>
            <SelectInput id="slot-session" hasError={!!errors.session} {...register("session")}>
              <option value="FN">Forenoon (FN)</option>
              <option value="AN">Afternoon (AN)</option>
            </SelectInput>
          </FormField>
          <FormField label="Start time" htmlFor="slot-start" required error={errors.start_time?.message}>
            <TextInput id="slot-start" type="time" hasError={!!errors.start_time} {...register("start_time")} />
          </FormField>
          <FormField label="End time" htmlFor="slot-end" required error={errors.end_time?.message}>
            <TextInput id="slot-end" type="time" hasError={!!errors.end_time} {...register("end_time")} />
          </FormField>
        </div>

        <FormField label="Venue" htmlFor="slot-venue" hint="Optional — checked for clashes on save" error={errors.venue_id?.message}>
          <SelectInput id="slot-venue" hasError={!!errors.venue_id} {...register("venue_id", numberFieldOptions)}>
            <option value="">No venue yet</option>
            {venuePage?.data.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.capacity ? `(cap. ${v.capacity})` : ""}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Schedule paper"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

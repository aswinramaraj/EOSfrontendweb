"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { SelectInput } from "@/shared/components/ui/SelectInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { numberFieldOptions, textFieldOptions } from "@/shared/lib/rhf-helpers";
import { useAllVenues } from "@/modules/venues/hooks/useVenues";
import { useExamSubjectMappings } from "../../hooks/useExamSubjectMapping";
import { useSubjects } from "@/modules/subjects/hooks/useSubjects";
import { useCreateMalpracticeIncident, useUpdateMalpracticeIncident } from "../../hooks/useMalpractice";
import {
  ACTION_LABELS,
  malpracticeFormSchema,
  NATURE_LABELS,
  type MalpracticeFormValues,
} from "../../schemas/malpractice-form.schema";
import type { CreateMalpracticeIncidentInput, MalpracticeIncident } from "../../types/malpractice";

interface MalpracticeFormModalProps {
  open: boolean;
  examId: number;
  incident: MalpracticeIncident | null;
  onClose: () => void;
}

function toDefaults(incident: MalpracticeIncident | null): MalpracticeFormValues {
  return {
    student_id: incident?.student_id,
    exam_subject_mapping_id: incident?.exam_subject_mapping_id ?? undefined,
    venue_id: incident?.venue_id ?? undefined,
    incident_date: incident?.incident_date.slice(0, 10) ?? "",
    session: incident?.session ?? "FN",
    seat_number: incident?.seat_number ?? undefined,
    nature: incident?.nature ?? "unauthorised_material",
    action_taken: incident?.action_taken ?? "reported_to_coe",
    invigilator_remarks: incident?.invigilator_remarks ?? undefined,
    reported_by_faculty_id: incident?.reported_by_faculty_id ?? undefined,
  };
}

export function MalpracticeFormModal({ open, examId, incident, onClose }: MalpracticeFormModalProps) {
  const { show } = useToast();
  const isEditing = incident !== null;

  const { data: mappings } = useExamSubjectMappings();
  const { data: subjects } = useSubjects();
  const { data: venuePage } = useAllVenues();

  const createIncident = useCreateMalpracticeIncident();
  const updateIncident = useUpdateMalpracticeIncident();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MalpracticeFormValues>({
    resolver: zodResolver(malpracticeFormSchema),
    defaultValues: toDefaults(incident),
  });

  useEffect(() => {
    reset(toDefaults(incident));
  }, [incident, open, reset]);

  const examMappings = (mappings ?? []).filter((m) => m.exam_id === examId);

  function mappingLabel(mappingId: number) {
    const mapping = examMappings.find((m) => m.id === mappingId);
    const subject = subjects?.find((s) => s.id === mapping?.subject_id);
    return subject ? `${subject.subject_code} · ${subject.name}` : `#${mappingId}`;
  }

  function onSubmit(values: MalpracticeFormValues) {
    const input: CreateMalpracticeIncidentInput = {
      student_id: values.student_id!,
      exam_id: examId,
      exam_subject_mapping_id: values.exam_subject_mapping_id,
      venue_id: values.venue_id,
      incident_date: values.incident_date,
      session: values.session,
      seat_number: values.seat_number,
      nature: values.nature,
      action_taken: values.action_taken,
      invigilator_remarks: values.invigilator_remarks,
      reported_by_faculty_id: values.reported_by_faculty_id,
    };

    const mutation = isEditing
      ? updateIncident.mutateAsync({ id: incident.id, input })
      : createIncident.mutateAsync(input);

    mutation
      .then(() => {
        show(isEditing ? "Incident updated." : "Incident recorded.", "success");
        onClose();
      })
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  const isPending = createIncident.isPending || updateIncident.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit incident" : "Record malpractice incident"} widthClassName="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Student ID" htmlFor="mp-student" required hint="No student directory API is exposed yet — enter the numeric ID." error={errors.student_id?.message}>
            <NumberInput id="mp-student" disabled={isEditing} hasError={!!errors.student_id} {...register("student_id", numberFieldOptions)} />
          </FormField>
          <FormField label="Paper (optional)" htmlFor="mp-mapping" error={errors.exam_subject_mapping_id?.message}>
            <SelectInput id="mp-mapping" hasError={!!errors.exam_subject_mapping_id} {...register("exam_subject_mapping_id", numberFieldOptions)}>
              <option value="">Not specified</option>
              {examMappings.map((m) => (
                <option key={m.id} value={m.id}>
                  {mappingLabel(m.id)}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Date" htmlFor="mp-date" required error={errors.incident_date?.message}>
            <TextInput id="mp-date" type="date" hasError={!!errors.incident_date} {...register("incident_date")} />
          </FormField>
          <FormField label="Session" htmlFor="mp-session" error={errors.session?.message}>
            <SelectInput id="mp-session" hasError={!!errors.session} {...register("session")}>
              <option value="FN">Forenoon (FN)</option>
              <option value="AN">Afternoon (AN)</option>
            </SelectInput>
          </FormField>
          <FormField label="Venue" htmlFor="mp-venue" error={errors.venue_id?.message}>
            <SelectInput id="mp-venue" hasError={!!errors.venue_id} {...register("venue_id", numberFieldOptions)}>
              <option value="">Not specified</option>
              {venuePage?.data.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Seat number" htmlFor="mp-seat" error={errors.seat_number?.message}>
            <TextInput id="mp-seat" hasError={!!errors.seat_number} {...register("seat_number", textFieldOptions)} />
          </FormField>
          <FormField label="Nature" htmlFor="mp-nature" required error={errors.nature?.message}>
            <SelectInput id="mp-nature" hasError={!!errors.nature} {...register("nature")}>
              {Object.entries(NATURE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Action taken" htmlFor="mp-action" required error={errors.action_taken?.message}>
            <SelectInput id="mp-action" hasError={!!errors.action_taken} {...register("action_taken")}>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Reported by (faculty ID)" htmlFor="mp-faculty" error={errors.reported_by_faculty_id?.message}>
            <NumberInput id="mp-faculty" hasError={!!errors.reported_by_faculty_id} {...register("reported_by_faculty_id", numberFieldOptions)} />
          </FormField>
        </div>

        <FormField label="Invigilator remarks" htmlFor="mp-remarks" error={errors.invigilator_remarks?.message}>
          <textarea
            id="mp-remarks"
            rows={3}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...register("invigilator_remarks", textFieldOptions)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Record incident"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

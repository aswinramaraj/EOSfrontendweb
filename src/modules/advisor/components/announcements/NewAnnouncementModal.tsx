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
import { useAssignedClasses, useCreateAnnouncement } from "../../hooks/useAnnouncements";
import {
  announcementFormSchema,
  type AnnouncementFormValues,
} from "../../schemas/announcement-form.schema";

interface NewAnnouncementModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewAnnouncementModal({ open, onClose }: NewAnnouncementModalProps) {
  const { show } = useToast();
  const { data: classes } = useAssignedClasses();
  const createAnnouncement = useCreateAnnouncement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: { title: "", content: "", target_audience: "students", class_id: classes?.[0]?.id },
  });

  useEffect(() => {
    reset({ title: "", content: "", target_audience: "students", class_id: classes?.[0]?.id });
  }, [open, classes, reset]);

  function onSubmit(values: AnnouncementFormValues) {
    createAnnouncement
      .mutateAsync({
        title: values.title,
        content: values.content,
        target_audience: values.target_audience,
        class_ids: [values.class_id!],
        status: "published",
      })
      .then(() => {
        show("Announcement published.", "success");
        onClose();
      })
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  return (
    <Modal open={open} onClose={onClose} title="New announcement">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Title" htmlFor="announcement-title" required error={errors.title?.message}>
          <TextInput id="announcement-title" hasError={!!errors.title} {...register("title")} />
        </FormField>

        <FormField label="Audience" htmlFor="announcement-audience" required>
          <SelectInput id="announcement-audience" {...register("target_audience")}>
            <option value="students">Students (entire class)</option>
            <option value="parents">Parents</option>
          </SelectInput>
        </FormField>

        <FormField label="Class" htmlFor="announcement-class" required error={errors.class_id?.message}>
          <SelectInput
            id="announcement-class"
            hasError={!!errors.class_id}
            {...register("class_id", numberFieldOptions)}
          >
            <option value="">Select a class</option>
            {classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Message" htmlFor="announcement-content" required error={errors.content?.message}>
          <textarea
            id="announcement-content"
            rows={4}
            className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.content ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
            {...register("content")}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={createAnnouncement.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={createAnnouncement.isPending}>
            Publish
          </Button>
        </div>
      </form>
    </Modal>
  );
}

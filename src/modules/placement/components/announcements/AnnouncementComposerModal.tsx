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
import { ApiError } from "@/shared/lib/api-client";
import { useDepartments } from "../../hooks/useDepartments";
import { useClasses } from "../../hooks/useClasses";
import { useBatches } from "../../hooks/useBatches";
import { useCreateAnnouncement, useUpdateAnnouncement } from "../../hooks/useAnnouncementMutations";
import { announcementFormSchema, type AnnouncementFormValues } from "../../schemas/announcement-form.schema";
import { ANNOUNCEMENT_CATEGORIES, type AnnouncementListItem, type CreateAnnouncementInput } from "../../types";

interface AnnouncementComposerModalProps {
  open: boolean;
  announcement: AnnouncementListItem | null;
  onClose: () => void;
}

const AUDIENCE_LABEL: Record<string, string> = {
  students: "Students",
  teachers: "Faculty / HODs",
  parents: "Parents",
};

function toDefaults(a: AnnouncementListItem | null): AnnouncementFormValues {
  return {
    title: a?.title ?? "",
    content: a?.content ?? "",
    targetAudience: a && a.targetAudience !== "roles" ? a.targetAudience : "students",
    category: (a?.category as AnnouncementFormValues["category"]) ?? undefined,
    status: a?.status ?? "published",
  };
}

/**
 * Remounted (via a `key` on the caller side) every time the modal opens for
 * a different announcement — that's what makes fresh initial state here
 * safe without an effect: React never reuses this instance across targets.
 */
function AnnouncementComposerForm({
  announcement,
  onClose,
}: {
  announcement: AnnouncementListItem | null;
  onClose: () => void;
}) {
  const { show } = useToast();
  const isEditing = announcement !== null;

  const departments = useDepartments();
  const classes = useClasses();
  const batches = useBatches();
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();

  const [classIds, setClassIds] = useState<Set<number>>(() => new Set(announcement?.classIds ?? []));
  const [classError, setClassError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: toDefaults(announcement),
  });

  const batchNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const b of batches.data ?? []) map.set(b.id, b.name);
    return map;
  }, [batches.data]);

  // Every real class grouped under its real department — an officer picks
  // concrete classes rather than a fictional "audience preset", since
  // CreateAnnouncementDto's class_ids is what's actually persisted.
  const groups = useMemo(() => {
    const deptById = new Map((departments.data ?? []).map((d) => [d.id, d]));
    const byDept = new Map<number, { deptName: string; classes: { id: number; label: string }[] }>();
    for (const c of classes.data ?? []) {
      const dept = deptById.get(c.departmentId);
      const deptName = dept ? `${dept.name} (${dept.code})` : `Department #${c.departmentId}`;
      const batchName = batchNameById.get(c.batchId) ?? `Batch #${c.batchId}`;
      const label = `${batchName} · Section ${c.section}${c.currentSemester ? ` · Sem ${c.currentSemester}` : ""}`;
      if (!byDept.has(c.departmentId)) byDept.set(c.departmentId, { deptName, classes: [] });
      byDept.get(c.departmentId)!.classes.push({ id: c.id, label });
    }
    return Array.from(byDept.values()).sort((a, b) => a.deptName.localeCompare(b.deptName));
  }, [departments.data, classes.data, batchNameById]);

  const allClassIds = useMemo(() => (classes.data ?? []).map((c) => c.id), [classes.data]);

  function toggleClass(id: number) {
    setClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setClassError(null);
  }

  function selectAll() {
    setClassIds(new Set(allClassIds));
    setClassError(null);
  }

  function selectDept(ids: number[]) {
    setClassIds((prev) => new Set([...prev, ...ids]));
    setClassError(null);
  }

  function clearClasses() {
    setClassIds(new Set());
  }

  function onSubmit(values: AnnouncementFormValues) {
    if (classIds.size === 0) {
      setClassError("Select at least one class to reach.");
      return;
    }

    const input: CreateAnnouncementInput = {
      title: values.title,
      content: values.content,
      targetAudience: values.targetAudience,
      classIds: Array.from(classIds),
      status: values.status,
      category: values.category || undefined,
    };

    const mutation = isEditing
      ? updateAnnouncement.mutateAsync({ id: announcement.id, input })
      : createAnnouncement.mutateAsync(input);

    mutation
      .then(() => {
        show(isEditing ? "Announcement updated." : "Announcement published.", "success");
        onClose();
      })
      .catch((err: unknown) => show(err instanceof ApiError ? err.message : "Something went wrong.", "error"));
  }

  const isPending = createAnnouncement.isPending || updateAnnouncement.isPending;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Headline" htmlFor="ann-title" required error={errors.title?.message}>
          <TextInput
            id="ann-title"
            placeholder="e.g. Pre-placement talk · 12 Aug · Main auditorium"
            hasError={!!errors.title}
            {...register("title")}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Audience" htmlFor="ann-audience" error={errors.targetAudience?.message}>
            <SelectInput id="ann-audience" hasError={!!errors.targetAudience} {...register("targetAudience")}>
              {Object.entries(AUDIENCE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Category" htmlFor="ann-category" error={errors.category?.message}>
            <SelectInput id="ann-category" hasError={!!errors.category} {...register("category")}>
              <option value="">No category</option>
              {ANNOUNCEMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c[0].toUpperCase() + c.slice(1)}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <FormField label="Message" htmlFor="ann-content" required error={errors.content?.message}>
          <textarea
            id="ann-content"
            rows={4}
            className={`w-full rounded-md border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              errors.content ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
            placeholder="Write the announcement in full"
            {...register("content")}
          />
        </FormField>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Classes <span className="ml-0.5 text-red-600">*</span>
            </label>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-slate-500">{classIds.size} of {allClassIds.length} selected</span>
              <button type="button" onClick={selectAll} className="text-blue-700 hover:underline">
                Select all
              </button>
              <button type="button" onClick={clearClasses} className="text-blue-700 hover:underline">
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 p-2">
            {classes.isLoading || departments.isLoading ? (
              <div className="p-2 text-sm text-slate-500">Loading classes…</div>
            ) : (
              groups.map((g) => (
                <div key={g.deptName} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between px-1 py-1">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{g.deptName}</span>
                    <button
                      type="button"
                      onClick={() => selectDept(g.classes.map((c) => c.id))}
                      className="text-xs font-semibold text-blue-700 hover:underline"
                    >
                      Select all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {g.classes.map((c) => (
                      <label
                        key={c.id}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={classIds.has(c.id)}
                          onChange={() => toggleClass(c.id)}
                          className="h-3.5 w-3.5"
                        />
                        {c.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          {classError && <p className="text-xs text-red-600">{classError}</p>}
        </div>

        <FormField label="Status" htmlFor="ann-status" error={errors.status?.message}>
          <SelectInput id="ann-status" hasError={!!errors.status} {...register("status")}>
            <option value="published">Publish now</option>
            <option value="draft">Save as draft</option>
          </SelectInput>
        </FormField>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Publish announcement"}
          </Button>
        </div>
      </form>
    </>
  );
}

export function AnnouncementComposerModal({ open, announcement, onClose }: AnnouncementComposerModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={announcement ? "Edit announcement" : "New announcement"}
      subtitle="Circulars and posts reach the classes you select below."
      widthClassName="max-w-2xl"
    >
      {open && (
        <AnnouncementComposerForm key={announcement?.id ?? "new"} announcement={announcement} onClose={onClose} />
      )}
    </Modal>
  );
}

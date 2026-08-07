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
import { useCategories } from "../../hooks/useCategories";
import { useCreateEResource, useUpdateEResource } from "../../hooks/useEResourceMutations";
import {
  eResourceFormSchema,
  type EResourceFormValues,
} from "../../schemas/e-resource-form.schema";
import type { EResource } from "../../types/e-resources";

interface EResourceFormModalProps {
  open: boolean;
  resource: EResource | null;
  onClose: () => void;
}

function toDefaults(resource: EResource | null): EResourceFormValues {
  return {
    title: resource?.title ?? "",
    url: resource?.url ?? "",
    category_id: resource?.category_id ?? undefined,
    format: resource?.format ?? undefined,
    file_size_bytes: resource?.file_size_bytes ?? undefined,
    pages: resource?.pages ?? undefined,
    license_type: resource?.license_type ?? undefined,
    concurrent_seats: resource?.concurrent_seats ?? undefined,
    publish_state: resource?.publish_state ?? "draft",
  };
}

export function EResourceFormModal({ open, resource, onClose }: EResourceFormModalProps) {
  const { show } = useToast();
  const isEditing = resource !== null;

  const { data: categories } = useCategories();
  const createResource = useCreateEResource();
  const updateResource = useUpdateEResource();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EResourceFormValues>({
    resolver: zodResolver(eResourceFormSchema),
    defaultValues: toDefaults(resource),
  });

  useEffect(() => {
    reset(toDefaults(resource));
  }, [resource, open, reset]);

  function onSubmit(values: EResourceFormValues) {
    const mutation = isEditing
      ? updateResource.mutateAsync({ id: resource.id, input: values })
      : createResource.mutateAsync(values);

    mutation
      .then(() => {
        show(isEditing ? "eBook updated." : "eBook added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createResource.isPending || updateResource.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit eBook" : "Add eBook"} widthClassName="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Title" htmlFor="ebook-title" required error={errors.title?.message}>
            <TextInput id="ebook-title" hasError={!!errors.title} {...register("title")} />
          </FormField>
          <FormField
            label="URL"
            htmlFor="ebook-url"
            required
            hint="Link to the uploaded file"
            error={errors.url?.message}
          >
            <TextInput id="ebook-url" hasError={!!errors.url} {...register("url")} />
          </FormField>

          <FormField label="Category" htmlFor="ebook-category" error={errors.category_id?.message}>
            <SelectInput
              id="ebook-category"
              hasError={!!errors.category_id}
              {...register("category_id", numberFieldOptions)}
            >
              <option value="">No category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Format" htmlFor="ebook-format" error={errors.format?.message}>
            <SelectInput id="ebook-format" hasError={!!errors.format} {...register("format", textFieldOptions)}>
              <option value="">Not set</option>
              <option value="PDF">PDF</option>
              <option value="EPUB">EPUB</option>
              <option value="MOBI">MOBI</option>
              <option value="DOCX">DOCX</option>
              <option value="Other">Other</option>
            </SelectInput>
          </FormField>

          <FormField label="License type" htmlFor="ebook-license" error={errors.license_type?.message}>
            <SelectInput
              id="ebook-license"
              hasError={!!errors.license_type}
              {...register("license_type", textFieldOptions)}
            >
              <option value="">Not set</option>
              <option value="institution_licence">Institution licence</option>
              <option value="open_access">Open access</option>
              <option value="department_copy">Department copy</option>
              <option value="reference_only">Reference only</option>
            </SelectInput>
          </FormField>
          <FormField label="Publish state" htmlFor="ebook-publish-state" error={errors.publish_state?.message}>
            <SelectInput
              id="ebook-publish-state"
              hasError={!!errors.publish_state}
              {...register("publish_state", textFieldOptions)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </SelectInput>
          </FormField>

          <FormField label="Pages" htmlFor="ebook-pages" error={errors.pages?.message}>
            <NumberInput id="ebook-pages" hasError={!!errors.pages} {...register("pages", numberFieldOptions)} />
          </FormField>
          <FormField
            label="File size (bytes)"
            htmlFor="ebook-file-size"
            error={errors.file_size_bytes?.message}
          >
            <NumberInput
              id="ebook-file-size"
              hasError={!!errors.file_size_bytes}
              {...register("file_size_bytes", numberFieldOptions)}
            />
          </FormField>
          <FormField
            label="Concurrent seats"
            htmlFor="ebook-seats"
            error={errors.concurrent_seats?.message}
          >
            <NumberInput
              id="ebook-seats"
              hasError={!!errors.concurrent_seats}
              {...register("concurrent_seats", numberFieldOptions)}
            />
          </FormField>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add eBook"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

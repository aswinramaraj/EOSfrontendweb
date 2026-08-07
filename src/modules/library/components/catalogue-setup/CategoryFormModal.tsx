"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { FormField } from "@/shared/components/ui/FormField";
import { TextInput } from "@/shared/components/ui/TextInput";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { useCreateCategory, useUpdateCategory } from "../../hooks/useCategories";
import { categoryFormSchema, type CategoryFormValues } from "../../schemas/category-form.schema";
import type { BookCategory } from "../../types/categories";

interface CategoryFormModalProps {
  open: boolean;
  category: BookCategory | null;
  onClose: () => void;
}

export function CategoryFormModal({ open, category, onClose }: CategoryFormModalProps) {
  const { show } = useToast();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isEditing = category !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: category?.name ?? "" },
  });

  useEffect(() => {
    reset({ name: category?.name ?? "" });
  }, [category, open, reset]);

  function onSubmit(values: CategoryFormValues) {
    const mutation = isEditing
      ? updateCategory.mutateAsync({ id: category.id, name: values.name })
      : createCategory.mutateAsync(values.name);

    mutation
      .then(() => {
        show(isEditing ? "Category updated." : "Category added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit category" : "Add category"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Name" htmlFor="category-name" required error={errors.name?.message}>
          <TextInput id="category-name" hasError={!!errors.name} {...register("name")} />
        </FormField>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

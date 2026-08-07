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
import { useDepartments } from "@/modules/departments/hooks/useDepartments";
import { useCategories } from "../../hooks/useCategories";
import { useRacks } from "../../hooks/useRacks";
import { useCreateBook, useUpdateBook } from "../../hooks/useBookMutations";
import { bookFormSchema, type BookFormValues } from "../../schemas/book-form.schema";
import type { Book, CreateBookInput } from "../../types/books";

interface BookFormModalProps {
  open: boolean;
  book: Book | null;
  onClose: () => void;
}

function toDefaults(book: Book | null): BookFormValues {
  return {
    qr_code: book?.qr_code ?? "",
    title: book?.title ?? "",
    author: book?.author ?? undefined,
    isbn: book?.isbn ?? undefined,
    publisher: book?.publisher ?? undefined,
    edition: book?.edition ?? undefined,
    category_id: book?.category_id,
    department_id: book?.department?.id,
    rack_id: book?.rack?.id,
    total_copies: book?.total_copies,
    available_copies: book?.available_copies,
    price_per_copy: book?.price_per_copy ?? undefined,
    vendor_fund: book?.vendor_fund ?? undefined,
  };
}

export function BookFormModal({ open, book, onClose }: BookFormModalProps) {
  const { show } = useToast();
  const isEditing = book !== null;

  const { data: categories } = useCategories();
  const { data: departments } = useDepartments();
  const { data: racks } = useRacks({ page_size: 100 });

  const createBook = useCreateBook();
  const updateBook = useUpdateBook();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: toDefaults(book),
  });

  useEffect(() => {
    reset(toDefaults(book));
  }, [book, open, reset]);

  function onSubmit(values: BookFormValues) {
    // The .refine() checks guarantee these are defined by the time we get
    // here — see book-form.schema.ts.
    const input: CreateBookInput = {
      qr_code: values.qr_code,
      title: values.title,
      category_id: values.category_id!,
      total_copies: values.total_copies!,
      author: values.author,
      isbn: values.isbn,
      publisher: values.publisher,
      edition: values.edition,
      department_id: values.department_id,
      rack_id: values.rack_id,
      available_copies: values.available_copies,
      price_per_copy: values.price_per_copy,
      vendor_fund: values.vendor_fund,
    };

    const mutation = isEditing
      ? updateBook.mutateAsync({ id: book.id, input })
      : createBook.mutateAsync(input);

    mutation
      .then(() => {
        show(isEditing ? "Book saved — copies updated." : "Book added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createBook.isPending || updateBook.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit book" : "Add book"} widthClassName="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Accession / QR code" htmlFor="book-qr-code" required error={errors.qr_code?.message}>
            <TextInput id="book-qr-code" hasError={!!errors.qr_code} {...register("qr_code")} />
          </FormField>
          <FormField label="Title" htmlFor="book-title" required error={errors.title?.message}>
            <TextInput id="book-title" hasError={!!errors.title} {...register("title")} />
          </FormField>
          <FormField label="Author" htmlFor="book-author" error={errors.author?.message}>
            <TextInput id="book-author" hasError={!!errors.author} {...register("author", textFieldOptions)} />
          </FormField>
          <FormField label="Edition" htmlFor="book-edition" error={errors.edition?.message}>
            <TextInput id="book-edition" hasError={!!errors.edition} {...register("edition", textFieldOptions)} />
          </FormField>
          <FormField label="ISBN" htmlFor="book-isbn" error={errors.isbn?.message}>
            <TextInput id="book-isbn" hasError={!!errors.isbn} {...register("isbn", textFieldOptions)} />
          </FormField>
          <FormField label="Publisher" htmlFor="book-publisher" error={errors.publisher?.message}>
            <TextInput id="book-publisher" hasError={!!errors.publisher} {...register("publisher", textFieldOptions)} />
          </FormField>

          <FormField label="Category" htmlFor="book-category" required error={errors.category_id?.message}>
            <SelectInput
              id="book-category"
              hasError={!!errors.category_id}
              {...register("category_id", numberFieldOptions)}
            >
              <option value="">Select a category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Department" htmlFor="book-department" error={errors.department_id?.message}>
            <SelectInput
              id="book-department"
              hasError={!!errors.department_id}
              {...register("department_id", numberFieldOptions)}
            >
              <option value="">No department</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Rack" htmlFor="book-rack" error={errors.rack_id?.message}>
            <SelectInput id="book-rack" hasError={!!errors.rack_id} {...register("rack_id", numberFieldOptions)}>
              <option value="">No rack</option>
              {racks?.data.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.rack_code}
                </option>
              ))}
            </SelectInput>
          </FormField>

          <FormField label="Total copies" htmlFor="book-total-copies" required error={errors.total_copies?.message}>
            <NumberInput
              id="book-total-copies"
              hasError={!!errors.total_copies}
              {...register("total_copies", numberFieldOptions)}
            />
          </FormField>
          <FormField
            label="Copies on shelf"
            htmlFor="book-available-copies"
            hint="Defaults to total copies if left blank"
            error={errors.available_copies?.message}
          >
            <NumberInput
              id="book-available-copies"
              hasError={!!errors.available_copies}
              {...register("available_copies", numberFieldOptions)}
            />
          </FormField>
          <FormField label="Price per copy" htmlFor="book-price" error={errors.price_per_copy?.message}>
            <NumberInput
              id="book-price"
              hasError={!!errors.price_per_copy}
              {...register("price_per_copy", numberFieldOptions)}
            />
          </FormField>
          <FormField label="Vendor / fund" htmlFor="book-vendor-fund" error={errors.vendor_fund?.message}>
            <TextInput id="book-vendor-fund" hasError={!!errors.vendor_fund} {...register("vendor_fund", textFieldOptions)} />
          </FormField>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add book"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

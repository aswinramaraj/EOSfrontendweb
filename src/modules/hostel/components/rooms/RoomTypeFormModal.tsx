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
import { useCreateRoomType, useUpdateRoomType } from "../../hooks/useRoomTypes";
import { roomTypeFormSchema, type RoomTypeFormValues } from "../../schemas/room-type-form.schema";
import type { RoomType } from "../../types/rooms";

interface RoomTypeFormModalProps {
  open: boolean;
  roomType: RoomType | null;
  onClose: () => void;
}

export function RoomTypeFormModal({ open, roomType, onClose }: RoomTypeFormModalProps) {
  const { show } = useToast();
  const createRoomType = useCreateRoomType();
  const updateRoomType = useUpdateRoomType();
  const isEditing = roomType !== null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomTypeFormValues>({
    resolver: zodResolver(roomTypeFormSchema),
    defaultValues: { name: roomType?.name ?? "" },
  });

  useEffect(() => {
    reset({ name: roomType?.name ?? "" });
  }, [roomType, open, reset]);

  function onSubmit(values: RoomTypeFormValues) {
    const mutation = isEditing
      ? updateRoomType.mutateAsync({ id: roomType.id, name: values.name })
      : createRoomType.mutateAsync(values.name);

    mutation
      .then(() => {
        show(isEditing ? "Room type updated." : "Room type added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createRoomType.isPending || updateRoomType.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit room type" : "Add room type"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Name" htmlFor="room-type-name" required error={errors.name?.message}>
          <TextInput id="room-type-name" hasError={!!errors.name} {...register("name")} />
        </FormField>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add room type"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

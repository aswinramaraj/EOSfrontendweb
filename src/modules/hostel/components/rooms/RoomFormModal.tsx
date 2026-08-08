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
import { numberFieldOptions } from "@/shared/lib/rhf-helpers";
import { useHostels } from "../../hooks/useHostels";
import { useRoomTypes } from "../../hooks/useRoomTypes";
import { useCreateRoom, useUpdateRoom } from "../../hooks/useRooms";
import { roomFormSchema, type RoomFormValues } from "../../schemas/room-form.schema";
import type { Room } from "../../types/rooms";

interface RoomFormModalProps {
  open: boolean;
  room: Room | null;
  onClose: () => void;
}

function toDefaults(room: Room | null): RoomFormValues {
  return {
    hostel_id: room?.hostel_id,
    room_number: room?.room_number ?? "",
    room_type_id: room?.room_type_id,
    capacity: room?.capacity,
  };
}

export function RoomFormModal({ open, room, onClose }: RoomFormModalProps) {
  const { show } = useToast();
  const isEditing = room !== null;

  const { data: hostels } = useHostels();
  const { data: roomTypes } = useRoomTypes();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: toDefaults(room),
  });

  useEffect(() => {
    reset(toDefaults(room));
  }, [room, open, reset]);

  function onSubmit(values: RoomFormValues) {
    // The .refine() checks guarantee these are defined by the time we get
    // here — see room-form.schema.ts.
    const input = {
      hostel_id: values.hostel_id!,
      room_number: values.room_number,
      room_type_id: values.room_type_id!,
      capacity: values.capacity!,
    };

    const mutation = isEditing
      ? updateRoom.mutateAsync({ id: room.id, input })
      : createRoom.mutateAsync(input);

    mutation
      .then(() => {
        show(isEditing ? "Room updated." : "Room added.", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
      });
  }

  const isPending = createRoom.isPending || updateRoom.isPending;

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit room" : "Add room"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField label="Hostel" htmlFor="room-hostel" required error={errors.hostel_id?.message}>
          <SelectInput
            id="room-hostel"
            hasError={!!errors.hostel_id}
            {...register("hostel_id", numberFieldOptions)}
          >
            <option value="">Select a hostel</option>
            {hostels?.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.code})
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Room number" htmlFor="room-number" required error={errors.room_number?.message}>
          <TextInput id="room-number" hasError={!!errors.room_number} {...register("room_number")} />
        </FormField>

        <FormField label="Room type" htmlFor="room-type" required error={errors.room_type_id?.message}>
          <SelectInput
            id="room-type"
            hasError={!!errors.room_type_id}
            {...register("room_type_id", numberFieldOptions)}
          >
            <option value="">Select a room type</option>
            {roomTypes?.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Capacity" htmlFor="room-capacity" required error={errors.capacity?.message}>
          <NumberInput
            id="room-capacity"
            hasError={!!errors.capacity}
            {...register("capacity", numberFieldOptions)}
          />
        </FormField>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isPending={isPending}>
            {isEditing ? "Save changes" : "Add room"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

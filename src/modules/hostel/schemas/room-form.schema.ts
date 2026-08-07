import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

// hostel_id/room_type_id are backend-required selects, but declared via
// optionalNumber (see its comment) so every numeric field shares one
// input/output-aligned shape — the .refine() below gives a clearer message
// than zod's generic "required" error would.
export const roomFormSchema = z
  .object({
    hostel_id: optionalNumber({ int: true, min: 1 }),
    room_number: z.string().trim().min(1, "Room number is required").max(20),
    room_type_id: optionalNumber({ int: true, min: 1 }),
    capacity: optionalNumber({ int: true, min: 1 }),
  })
  .refine((v) => v.hostel_id !== undefined, {
    path: ["hostel_id"],
    message: "Choose a hostel",
  })
  .refine((v) => v.room_type_id !== undefined, {
    path: ["room_type_id"],
    message: "Choose a room type",
  })
  .refine((v) => v.capacity !== undefined, {
    path: ["capacity"],
    message: "Capacity is required",
  });

export type RoomFormValues = z.infer<typeof roomFormSchema>;

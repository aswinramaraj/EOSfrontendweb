import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

// venue_id is a backend-required select, declared via optionalNumber (see
// its comment) so the .refine() below can give a clearer message than zod's
// generic "required" error would — same convention as hostel's room-form.schema.ts.
export const bookingFormSchema = z
  .object({
    venue_id: optionalNumber({ int: true, min: 1 }),
    from_time: z.string().min(1, "Start time is required"),
    to_time: z.string().min(1, "End time is required"),
    accommodating_strength: optionalNumber({ int: true, min: 1 }),
    purpose: z.string().trim().min(1, "Purpose is required").max(255),
  })
  .refine((v) => v.venue_id !== undefined, {
    path: ["venue_id"],
    message: "Select a venue",
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

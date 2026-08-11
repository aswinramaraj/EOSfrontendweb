import { z } from "zod";

export const roomTypeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

export type RoomTypeFormValues = z.infer<typeof roomTypeFormSchema>;

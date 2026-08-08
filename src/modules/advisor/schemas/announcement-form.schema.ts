import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

export const announcementFormSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(150),
    content: z.string().trim().min(1, "Message is required"),
    target_audience: z.enum(["students", "parents"]),
    class_id: optionalNumber({ int: true, min: 1 }),
  })
  .refine((v) => v.class_id !== undefined, {
    path: ["class_id"],
    message: "Choose a class",
  });

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const timetableSlotFormSchema = z
  .object({
    exam_subject_mapping_id: optionalNumber({ int: true, min: 1 }),
    exam_date: z.string().min(1, "Date is required"),
    session: z.enum(["FN", "AN"]),
    start_time: z.string().regex(TIME_REGEX, "Use HH:mm"),
    end_time: z.string().regex(TIME_REGEX, "Use HH:mm"),
    venue_id: optionalNumber({ int: true, min: 1 }),
  })
  .refine((v) => v.exam_subject_mapping_id !== undefined, {
    path: ["exam_subject_mapping_id"],
    message: "Choose a paper",
  })
  .refine((v) => v.start_time < v.end_time, {
    path: ["end_time"],
    message: "End time must be after start time",
  });

export type TimetableSlotFormValues = z.infer<typeof timetableSlotFormSchema>;

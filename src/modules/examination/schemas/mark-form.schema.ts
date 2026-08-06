import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

export const markFormSchema = z
  .object({
    exam_subject_mapping_id: optionalNumber({ int: true, min: 1 }),
    student_id: optionalNumber({ int: true, min: 1 }),
    marks_obtained: optionalNumber({ min: 0 }),
    max_marks: optionalNumber({ min: 1 }),
    is_absent: z.boolean().optional(),
  })
  .refine((v) => v.max_marks !== undefined, {
    path: ["max_marks"],
    message: "Maximum marks is required",
  });

export type MarkFormValues = z.infer<typeof markFormSchema>;

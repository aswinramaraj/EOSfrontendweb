import { z } from "zod";
import { optionalNumber, optionalText } from "@/shared/lib/zod-helpers";

export const examFormSchema = z
  .object({
    exam_type_id: optionalNumber({ int: true, min: 1 }),
    batch_id: optionalNumber({ int: true, min: 1 }),
    academic_year: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{4}$/, "Use the format YYYY-YYYY"),
    semester: optionalNumber({ int: true, min: 1, max: 12 }),
    title: optionalText(200),
    start_date: optionalText(10),
    end_date: optionalText(10),
  })
  .refine((v) => v.exam_type_id !== undefined, {
    path: ["exam_type_id"],
    message: "Choose an examination type",
  })
  .refine((v) => v.batch_id !== undefined, {
    path: ["batch_id"],
    message: "Choose a batch",
  })
  .refine((v) => v.semester !== undefined, {
    path: ["semester"],
    message: "Semester is required",
  });

export type ExamFormValues = z.infer<typeof examFormSchema>;

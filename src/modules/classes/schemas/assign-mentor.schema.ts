import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

// academic_year mirrors the backend's AssignMentorDto: YYYY-YY, e.g. 2025-26.
export const assignMentorSchema = z
  .object({
    faculty_id: optionalNumber({ int: true, min: 1 }),
    academic_year: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}$/, "Use the format YYYY-YY, e.g. 2025-26"),
  })
  .refine((v) => v.faculty_id !== undefined, {
    path: ["faculty_id"],
    message: "Choose a faculty member",
  });

export type AssignMentorFormValues = z.infer<typeof assignMentorSchema>;

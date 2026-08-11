import { z } from "zod";

export const appraisalCriterionFormSchema = z.object({
  division_id: z.number({ error: "Division is required" }).int(),
  criteria_name: z.string().trim().min(1, "Criteria name is required").max(255),
  max_score: z
    .number({ error: "Max score is required" })
    .int("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(1000),
  academic_year: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, "Format: YYYY-YYYY, e.g. 2025-2026"),
});

export type AppraisalCriterionFormValues = z.infer<typeof appraisalCriterionFormSchema>;

export const divisionFormSchema = z.object({
  name: z.string().trim().min(1, "Division name is required").max(255),
});

export type DivisionFormValues = z.infer<typeof divisionFormSchema>;

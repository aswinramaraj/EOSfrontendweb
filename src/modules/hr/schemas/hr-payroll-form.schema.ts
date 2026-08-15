import { z } from "zod";

export const hrPayrollFormSchema = z.object({
  faculty_id: z.number({ error: "Faculty is required" }).int(),
  month: z
    .string()
    .trim()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format: YYYY-MM"),
  basic_salary: z.number({ error: "Basic salary is required" }).min(0),
  hra: z.number({ error: "HRA is required" }).min(0),
  da: z.number({ error: "DA is required" }).min(0),
  pf_deduction: z.number().min(0).optional(),
  other_deductions: z.number().min(0).optional(),
});

export type HrPayrollFormValues = z.infer<typeof hrPayrollFormSchema>;

import { z } from "zod";
import { optionalText } from "@/shared/lib/zod-helpers";

export const examTypeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  code: optionalText(20),
  category: z.enum(["internal", "external"]).optional(),
  is_university: z.boolean().optional(),
});

export type ExamTypeFormValues = z.infer<typeof examTypeFormSchema>;

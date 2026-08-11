import { z } from "zod";
import { optionalText } from "@/shared/lib/zod-helpers";

// student_id is chosen via ResidentPicker outside this form (not a plain
// input), so it isn't part of the schema — see ComplaintFormModal.
export const complaintFormSchema = z.object({
  category: z.enum([
    "plumbing",
    "electrical",
    "carpentry",
    "network",
    "mess",
    "facilities",
    "other",
  ]),
  title: z.string().trim().min(1, "Title is required").max(150),
  description: optionalText(1000),
  priority: z.enum(["low", "medium", "high"]),
});

export type ComplaintFormValues = z.infer<typeof complaintFormSchema>;

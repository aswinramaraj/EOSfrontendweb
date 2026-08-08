import { z } from "zod";
import { optionalText } from "@/shared/lib/zod-helpers";

// student_id is chosen via ResidentPicker outside this form — see
// MessFeedbackFormModal.
export const messFeedbackFormSchema = z.object({
  rating: z.number().int().min(1, "Pick a rating").max(5),
  comment: optionalText(1000),
});

export type MessFeedbackFormValues = z.infer<typeof messFeedbackFormSchema>;

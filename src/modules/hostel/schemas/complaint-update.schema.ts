import { z } from "zod";
import { optionalText } from "@/shared/lib/zod-helpers";

export const complaintUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "escalated"]),
  priority: z.enum(["low", "medium", "high"]),
  assigned_to: optionalText(150),
  resolution_note: optionalText(2000),
});

export type ComplaintUpdateValues = z.infer<typeof complaintUpdateSchema>;

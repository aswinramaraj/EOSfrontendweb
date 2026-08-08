import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";
import { MEDIA_REQUEST_TYPES } from "../types";

export const mediaRequestFormSchema = z.object({
  event_name: z.string().trim().max(255).optional(),
  event_date: z.string().optional(),
  venue_id: optionalNumber({ int: true, min: 1 }),
  coordinator_name: z.string().trim().max(150).optional(),
  contact_number: z.string().trim().max(20).optional(),
  media_types: z.array(z.enum(MEDIA_REQUEST_TYPES)),
  description: z.string().trim().min(1, "Purpose is required").max(500),
});

export type MediaRequestFormValues = z.infer<typeof mediaRequestFormSchema>;

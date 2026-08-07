import { z } from "zod";
import { optionalNumber, optionalText } from "@/shared/lib/zod-helpers";

export const hostelFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  code: z.string().trim().min(1, "Code is required").max(20),
  wing: z.enum(["boys", "girls"]),
  warden_user_id: optionalNumber({ int: true, min: 1 }),
  phone: optionalText(20),
  mess_type: optionalText(100),
  established_year: optionalNumber({ int: true, min: 1900, max: 2100 }),
});

export type HostelFormValues = z.infer<typeof hostelFormSchema>;

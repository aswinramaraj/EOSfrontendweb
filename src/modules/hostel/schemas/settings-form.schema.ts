import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

// Same reasoning as library's settings-form.schema.ts: the backend DTO
// treats every field as optional (a PATCH can touch just one setting), but
// the form always loads pre-filled with the current row, so a numeric field
// a user has cleared should read as "please provide a value".
const REQUIRED_NUMERIC_FIELDS = [
  ["min_attendance_for_auto_pct", "Minimum attendance % is required"],
  ["max_outing_days", "Max outing days is required"],
] as const;

export const hostelSettingsFormSchema = z
  .object({
    auto_approve_low_risk: z.boolean(),
    min_attendance_for_auto_pct: optionalNumber({ min: 0, max: 100 }),
    require_biometric_pop: z.boolean(),
    sms_guardian_on_checkout: z.boolean(),
    alert_on_overdue_return: z.boolean(),
    weekly_arrears_reminder: z.boolean(),
    publish_resolved_complaints: z.boolean(),
    max_outing_days: optionalNumber({ int: true, min: 1 }),
  })
  .superRefine((values, ctx) => {
    for (const [key, message] of REQUIRED_NUMERIC_FIELDS) {
      if (values[key] === undefined) {
        ctx.addIssue({ code: "custom", path: [key], message });
      }
    }
  });

export type HostelSettingsFormValues = z.infer<typeof hostelSettingsFormSchema>;

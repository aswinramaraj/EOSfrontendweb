import { z } from "zod";
import { optionalNumber, optionalText } from "@/shared/lib/zod-helpers";

// The backend's own DTO treats every field as optional (a PATCH can touch
// just one setting) — but the form always loads pre-filled with the current
// row, so a numeric field a user has cleared should read as "please provide
// a value", not "silently leave unchanged". Checked in one superRefine
// rather than one .refine() per field.
const REQUIRED_NUMERIC_FIELDS = [
  ["books_per_student", "Books per student is required"],
  ["default_borrowing_days", "Default borrowing days is required"],
  ["max_renewals", "Max renewals is required"],
  ["renewal_extension_days", "Renewal extension days is required"],
  ["fine_per_day", "Fine per day is required"],
  ["lost_book_processing_fee", "Lost book processing fee is required"],
  ["damaged_book_charge_rate", "Damaged book charge rate is required"],
  ["grace_period_days", "Grace period days is required"],
  ["block_issue_above_fine", "Block-issue threshold is required"],
] as const;

export const settingsFormSchema = z
  .object({
    books_per_student: optionalNumber({ int: true, min: 1 }),
    default_borrowing_days: optionalNumber({ int: true, min: 1 }),
    max_renewals: optionalNumber({ int: true, min: 0 }),
    renewal_extension_days: optionalNumber({ int: true, min: 1 }),
    fine_per_day: optionalNumber({ min: 0 }),
    lost_book_processing_fee: optionalNumber({ min: 0 }),
    // A rate/fraction (e.g. 0.4 = 40% of the book's price) — capped at 1.
    damaged_book_charge_rate: optionalNumber({ min: 0, max: 1 }),
    grace_period_days: optionalNumber({ int: true, min: 0 }),
    block_issue_above_fine: optionalNumber({ min: 0 }),
    barcode_format: optionalText(30),
    spine_label_prefix: optionalText(20),
    counter_opens_at: optionalText(10),
    counter_closes_at: optionalText(10),
  })
  .superRefine((values, ctx) => {
    for (const [key, message] of REQUIRED_NUMERIC_FIELDS) {
      if (values[key] === undefined) {
        ctx.addIssue({ code: "custom", path: [key], message });
      }
    }
  });

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

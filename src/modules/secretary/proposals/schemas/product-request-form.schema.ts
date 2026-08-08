import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

// Same "blank rows allowed while drafting" reasoning as
// service-request-form.schema.ts — quantity is optional at the schema level
// (an empty number input arrives as undefined via numberFieldOptions, see
// optionalNumber's comment) so a half-filled row never blocks a draft save;
// a real quantity is required only for rows that survive the blank-row
// filter before submit.
export const productRequestFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  justification: z.string().trim().max(1000).optional(),
  items: z.array(
    z.object({
      product_name: z.string().trim().max(255),
      quantity: optionalNumber({ int: true, min: 1 }),
      purpose: z.string().trim().max(255).optional(),
    }),
  ),
});

export type ProductRequestFormValues = z.infer<typeof productRequestFormSchema>;

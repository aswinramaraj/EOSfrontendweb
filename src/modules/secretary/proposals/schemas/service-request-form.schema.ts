import { z } from "zod";

// Item rows aren't required to be filled in at every keystroke — a draft is
// allowed to have a half-typed or blank row while the user is still editing.
// Blank rows are filtered out before the request is sent to the API (see
// ServiceRequestForm's submit handler); "at least one real item" is only
// enforced when actually submitting for approval, not on every save.
export const serviceRequestFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  justification: z.string().trim().max(1000).optional(),
  items: z.array(
    z.object({
      service_name: z.string().trim().max(255),
    }),
  ),
});

export type ServiceRequestFormValues = z.infer<typeof serviceRequestFormSchema>;

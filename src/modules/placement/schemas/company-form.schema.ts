import { z } from "zod";

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(200),
  profileInfo: z.string().trim().max(2000).optional(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

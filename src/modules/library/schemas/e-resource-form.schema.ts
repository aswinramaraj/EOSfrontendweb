import { z } from "zod";
import { optionalNumber } from "@/shared/lib/zod-helpers";

export const eResourceFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  url: z.string().trim().min(1, "URL is required").max(500).url("Enter a valid URL"),
  category_id: optionalNumber({ int: true, min: 1 }),
  format: z.enum(["PDF", "EPUB", "MOBI", "DOCX", "Other"]).optional(),
  file_size_bytes: optionalNumber({ int: true, min: 0 }),
  pages: optionalNumber({ int: true, min: 1 }),
  license_type: z
    .enum(["institution_licence", "open_access", "department_copy", "reference_only"])
    .optional(),
  concurrent_seats: optionalNumber({ int: true, min: 1 }),
  publish_state: z.enum(["draft", "published"]).optional(),
});

export type EResourceFormValues = z.infer<typeof eResourceFormSchema>;

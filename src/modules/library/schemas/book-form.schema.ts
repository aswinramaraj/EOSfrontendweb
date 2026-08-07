import { z } from "zod";
import { optionalNumber, optionalText } from "@/shared/lib/zod-helpers";

// category_id/total_copies are backend-required, but are still declared
// via optionalNumber (see its comment) so every numeric field in this form
// shares one input/output-aligned shape — the "actually required" check
// happens in the .refine() calls below with a clearer message than zod's
// generic "required" error would give.
export const bookFormSchema = z
  .object({
    qr_code: z.string().trim().min(1, "Accession / QR code is required").max(100),
    title: z.string().trim().min(1, "Title is required").max(255),
    author: optionalText(255),
    isbn: optionalText(30),
    publisher: optionalText(255),
    edition: optionalText(50),
    category_id: optionalNumber({ int: true, min: 1 }),
    department_id: optionalNumber({ int: true, min: 1 }),
    rack_id: optionalNumber({ int: true, min: 1 }),
    total_copies: optionalNumber({ int: true, min: 1 }),
    available_copies: optionalNumber({ int: true, min: 0 }),
    price_per_copy: optionalNumber({ min: 0 }),
    vendor_fund: optionalText(255),
  })
  .refine((v) => v.category_id !== undefined, {
    path: ["category_id"],
    message: "Choose a category",
  })
  .refine((v) => v.total_copies !== undefined, {
    path: ["total_copies"],
    message: "Total copies is required",
  })
  // Mirrors the backend's own BadRequestException for this — catching it
  // client-side turns a round-trip into an inline message.
  .refine(
    (v) =>
      v.available_copies === undefined ||
      v.total_copies === undefined ||
      v.available_copies <= v.total_copies,
    { path: ["available_copies"], message: "Copies on shelf cannot exceed total copies" },
  );

export type BookFormValues = z.infer<typeof bookFormSchema>;

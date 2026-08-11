import { z } from "zod";

// Assumes the field is registered with textFieldOptions (see
// shared/lib/rhf-helpers.ts), which converts "" -> undefined at the RHF
// layer — see optionalNumber's comment for why that (rather than a zod
// transform) is what keeps this schema's input/output types aligned.
export function optionalText(max: number) {
  return z.string().trim().max(max).optional();
}

interface OptionalNumberOptions {
  int?: boolean;
  min?: number;
  max?: number;
}

// Assumes the field is registered with numberFieldOptions (see
// shared/lib/rhf-helpers.ts), which converts "" -> undefined and
// string -> Number at the RHF layer before zod ever sees the value. That
// keeps this schema's input and output types identical (no coerce/
// preprocess), which is what lets zodResolver's inferred type match
// useForm's generic without the input/output split that a preprocess-based
// version runs into.
export function optionalNumber({ int, min, max }: OptionalNumberOptions = {}) {
  let schema = int ? z.number().int() : z.number();
  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);
  return schema.optional();
}

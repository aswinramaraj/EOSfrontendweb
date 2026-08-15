import type { FeeStructureAppliesTo } from "./types";

export const APPLIES_TO_LABELS: Record<FeeStructureAppliesTo, string> = {
  quota: "Quota",
  hostel: "Hostel",
  transport: "Transport",
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

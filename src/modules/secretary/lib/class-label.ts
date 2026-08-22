import type { Batch, Department, SchoolClass } from "@/modules/secretary/timetable/types";

/**
 * `classes.findAll()` (GET /classes) returns raw rows with only foreign
 * keys (department_id, batch_id) — no nested names — so a readable label
 * needs a client-side join against /departments and /batches. Shared by
 * Timetable and Attendance, both of which need a "pick a class" dropdown.
 * Plain function, not a hook — takes already-fetched lists, does no
 * fetching or hook calls itself.
 */
export function buildClassLabeler(
  departments: Department[] | undefined,
  batches: Batch[] | undefined,
) {
  const deptById = new Map((departments ?? []).map((d) => [d.id, d]));
  const batchById = new Map((batches ?? []).map((b) => [b.id, b]));

  return (klass: Pick<SchoolClass, "department_id" | "batch_id" | "section">) => {
    const dept = deptById.get(klass.department_id);
    const batch = batchById.get(klass.batch_id);
    return `${dept?.code ?? "—"} ${klass.section}${batch ? ` (${batch.name})` : ""}`;
  };
}

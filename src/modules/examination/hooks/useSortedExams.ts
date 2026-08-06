import { useMemo } from "react";
import { useExams } from "./useExams";

/** Most recently started exam first — the reasonable "current exam" default across every exam-scoped screen. */
export function useSortedExams() {
  const query = useExams();

  const sorted = useMemo(
    () =>
      [...(query.data ?? [])].sort((a, b) => {
        const aDate = a.start_date ?? "";
        const bDate = b.start_date ?? "";
        return bDate.localeCompare(aDate) || b.id - a.id;
      }),
    [query.data],
  );

  return { ...query, data: sorted };
}

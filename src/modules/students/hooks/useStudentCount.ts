import { useQuery } from "@tanstack/react-query";
import { studentsService } from "../services/students.service";
import type { ListStudentsParams } from "../types";

/**
 * Reads only `meta.total` for a given filter — asks the server for a single
 * row (`limit: 1`) instead of pulling every matching student just to count
 * them, so this stays cheap regardless of roll size.
 */
export function useStudentCount(params: ListStudentsParams = {}) {
  return useQuery({
    queryKey: ["students", "count", params],
    queryFn: () => studentsService.findAll({ ...params, limit: 1 }),
    select: (res) => res.meta.total,
  });
}

import { useQuery } from "@tanstack/react-query";
import { studentLookupService } from "../services/student-lookup.service";
import { libraryKeys } from "../query-keys";

// Backend rejects q shorter than 2 characters — gating here avoids firing a
// request that's guaranteed to 400.
export function useStudentSearch(q: string) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: libraryKeys.students.search(trimmed),
    queryFn: () => studentLookupService.search(trimmed),
    enabled: trimmed.length >= 2,
  });
}

export function useStudentNoDues(studentId: number | undefined) {
  return useQuery({
    queryKey: libraryKeys.students.noDues(studentId ?? -1),
    queryFn: () => studentLookupService.noDuesCheck(studentId as number),
    enabled: studentId !== undefined,
  });
}

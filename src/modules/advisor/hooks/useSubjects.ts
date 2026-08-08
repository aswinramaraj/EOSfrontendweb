import { useQuery } from "@tanstack/react-query";
import { subjectsService } from "../services/subjects.service";
import { advisorKeys } from "../query-keys";

export function useClassSubjects(facultyId: number | undefined, classId: number | undefined) {
  return useQuery({
    queryKey: [...advisorKeys.all, "subjects", facultyId, classId],
    queryFn: () => subjectsService.listForClass(facultyId!, classId!),
    enabled: facultyId !== undefined && classId !== undefined,
  });
}

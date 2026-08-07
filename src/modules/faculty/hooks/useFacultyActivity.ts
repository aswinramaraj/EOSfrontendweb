import { useQuery } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";

export function useFacultyActivity(facultyId: number | null) {
  return useQuery({
    queryKey: facultyKeys.activity(facultyId ?? -1),
    queryFn: () => facultyService.listActivity(facultyId as number),
    enabled: facultyId !== null && Number.isFinite(facultyId),
  });
}

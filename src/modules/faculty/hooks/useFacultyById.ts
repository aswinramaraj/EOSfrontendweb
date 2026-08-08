import { useQuery } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";

export function useFacultyById(id: number | null) {
  return useQuery({
    queryKey: facultyKeys.detail(id ?? -1),
    queryFn: () => facultyService.get(id as number),
    enabled: id !== null && Number.isFinite(id),
  });
}

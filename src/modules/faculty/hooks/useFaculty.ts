import { useQuery } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";
import type { FacultyListParams } from "../types";

export function useFacultyList(params: FacultyListParams = {}) {
  return useQuery({
    queryKey: facultyKeys.list(params),
    queryFn: () => facultyService.list(params),
  });
}

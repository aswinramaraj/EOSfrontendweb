import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";
import type { FacultyListParams } from "../types";

// All filtering (department_id, status, designation, employment_status,
// joining year, name/email search) and pagination happen server-side now —
// see FACULTY_MODULE_UPDATE.md. Nothing here needs to over-fetch and filter
// client-side.
export function useFaculties(params: FacultyListParams) {
  return useQuery({
    queryKey: facultyKeys.list(params),
    queryFn: () => facultyService.list(params),
    placeholderData: keepPreviousData,
  });
}

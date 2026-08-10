import { useQuery } from "@tanstack/react-query";
import { facultyMappingService } from "../services/faculty-mapping.service";
import { facultyKeys } from "../query-keys";
import type { FacultyMappingListParams } from "../types/faculty-mapping";

export function useFacultyMappings(params: FacultyMappingListParams) {
  return useQuery({
    queryKey: facultyKeys.mappings(params),
    queryFn: () => facultyMappingService.list(params),
    enabled: params.faculty_id !== undefined,
  });
}

// For the Academic Assignments browse page — unlike useFacultyMappings above,
// this has no faculty_id requirement, since that page lists mappings across
// all faculty (optionally narrowed by whichever filters are set).
export function useFacultyMappingsBrowse(params: FacultyMappingListParams) {
  return useQuery({
    queryKey: facultyKeys.mappings(params),
    queryFn: () => facultyMappingService.list(params),
  });
}

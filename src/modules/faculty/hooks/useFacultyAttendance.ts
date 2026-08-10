import { useQuery } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";

export function useFacultyAttendance(facultyId: number | null) {
  return useQuery({
    queryKey: facultyKeys.attendance(facultyId ?? -1),
    queryFn: () => facultyService.getAttendance(facultyId as number),
    enabled: facultyId !== null && Number.isFinite(facultyId),
  });
}

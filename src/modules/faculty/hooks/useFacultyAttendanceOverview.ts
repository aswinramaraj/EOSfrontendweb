import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { facultyService } from "../services/faculty.service";
import { facultyKeys } from "../query-keys";
import type { FacultyAttendanceOverviewParams } from "../types";

export function useFacultyAttendanceOverview(params: FacultyAttendanceOverviewParams) {
  return useQuery({
    queryKey: facultyKeys.attendanceOverview(params),
    queryFn: () => facultyService.getAttendanceOverview(params),
    placeholderData: keepPreviousData,
  });
}

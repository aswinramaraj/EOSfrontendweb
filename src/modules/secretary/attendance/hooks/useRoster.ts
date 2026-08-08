import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "../services/attendance.service";
import { attendanceKeys } from "../query-keys";

export function useRoster(classId: number | undefined) {
  return useQuery({
    queryKey: attendanceKeys.roster(classId ?? 0),
    queryFn: () => attendanceService.getRoster(classId as number),
    enabled: Boolean(classId),
  });
}

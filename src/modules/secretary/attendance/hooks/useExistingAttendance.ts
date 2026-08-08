import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "../services/attendance.service";
import { attendanceKeys } from "../query-keys";

export function useExistingAttendance(classId: number | undefined, date: string | undefined) {
  return useQuery({
    queryKey: attendanceKeys.existing(classId ?? 0, date ?? ""),
    queryFn: () => attendanceService.listForClassAndDate(classId as number, date as string),
    enabled: Boolean(classId && date),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attendanceService, type AttendanceListParams } from "../services/attendance.service";
import { advisorKeys } from "../query-keys";
import type { MarkClassAttendanceInput } from "../types";

export function useAttendanceList(params: AttendanceListParams) {
  return useQuery({
    queryKey: advisorKeys.attendance(params),
    queryFn: () => attendanceService.list(params),
    enabled: params.class_id !== undefined && !!params.date,
  });
}

export function useMarkClassAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, input }: { classId: number; input: MarkClassAttendanceInput }) =>
      attendanceService.markForClass(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...advisorKeys.all, "attendance"] });
      queryClient.invalidateQueries({ queryKey: advisorKeys.dashboard() });
    },
  });
}

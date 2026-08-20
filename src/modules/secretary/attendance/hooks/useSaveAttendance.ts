import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "../services/attendance.service";
import { attendanceKeys } from "../query-keys";
import type { CreateAttendanceInput } from "../types";

export function useSaveAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAttendanceInput) => attendanceService.create(input),
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.existing(input.class_id, input.date),
      });
    },
  });
}

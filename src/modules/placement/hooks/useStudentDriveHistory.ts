import { useQuery } from "@tanstack/react-query";
import { studentReportService } from "../services/student-report.service";
import { placementKeys } from "../query-keys";

export function useStudentDriveHistory(studentId: number | null) {
  return useQuery({
    queryKey: placementKeys.studentDriveHistory(studentId ?? 0),
    queryFn: () => studentReportService.history(studentId!),
    enabled: studentId !== null,
  });
}

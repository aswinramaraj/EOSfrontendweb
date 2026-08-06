import { useQuery } from "@tanstack/react-query";
import { examReportsService } from "../services/reports.service";
import { examinationKeys } from "../query-keys";
import type { ReportKey } from "../types/reports";

export function useExamReportPreview(key: ReportKey, examId: number | undefined) {
  return useQuery({
    queryKey: examinationKeys.reports.preview(key, examId ?? 0),
    queryFn: () => examReportsService.preview(key, examId!),
    enabled: examId !== undefined,
  });
}

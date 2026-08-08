import { useQuery } from "@tanstack/react-query";
import { secretaryReportsService } from "../services/reports.service";
import { secretaryReportsKeys } from "../query-keys";

export function useReportsSummary() {
  return useQuery({
    queryKey: secretaryReportsKeys.summary(),
    queryFn: secretaryReportsService.summary,
  });
}

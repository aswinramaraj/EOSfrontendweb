import { useQuery } from "@tanstack/react-query";
import { reportsService } from "../services/reports.service";
import { placementKeys } from "../query-keys";

export function useReportsSummary(batchId?: number) {
  return useQuery({
    queryKey: placementKeys.reports(batchId),
    queryFn: () => reportsService.summary(batchId),
  });
}

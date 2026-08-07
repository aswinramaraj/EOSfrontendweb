import { useQuery } from "@tanstack/react-query";
import { reportsService } from "../services/reports.service";
import { libraryKeys } from "../query-keys";
import type { ReportFilters, ReportKey } from "../types/reports";

export function useReportPreview(key: ReportKey, filters: ReportFilters) {
  return useQuery({
    queryKey: libraryKeys.reports.preview(key, filters),
    queryFn: () => reportsService.preview(key, filters),
    staleTime: 60_000,
  });
}

import { useQuery } from "@tanstack/react-query";
import { hostelReportsService } from "../services/reports.service";
import { hostelKeys } from "../query-keys";
import type { HostelReportFilters, HostelReportKey } from "../types/reports";

export function useHostelReportPreview(key: HostelReportKey, filters: HostelReportFilters) {
  return useQuery({
    queryKey: hostelKeys.reports.preview(key, filters),
    queryFn: () => hostelReportsService.preview(key, filters),
    staleTime: 60_000,
  });
}

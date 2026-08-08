import { useQuery } from "@tanstack/react-query";
import { secretaryReportsService } from "../services/reports.service";
import { secretaryReportsKeys } from "../query-keys";
import type { SecretaryReportFilters, SecretaryReportKey } from "../types";

export function useReportPreview(key: SecretaryReportKey, filters: SecretaryReportFilters) {
  return useQuery({
    queryKey: secretaryReportsKeys.preview(key, filters),
    queryFn: () => secretaryReportsService.preview(key, filters),
    staleTime: 60_000,
  });
}

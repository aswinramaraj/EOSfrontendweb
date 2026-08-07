import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import { libraryKeys } from "../query-keys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: libraryKeys.dashboard(),
    queryFn: dashboardService.summary,
  });
}

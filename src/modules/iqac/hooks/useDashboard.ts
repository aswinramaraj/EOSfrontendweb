import { useQuery } from "@tanstack/react-query";
import { iqacDashboardService } from "../services/dashboard.service";
import { iqacKeys } from "../query-keys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: iqacKeys.dashboardSummary(),
    queryFn: iqacDashboardService.summary,
  });
}

export function useDashboardLiveStatus() {
  return useQuery({
    queryKey: iqacKeys.dashboardLiveStatus(),
    queryFn: iqacDashboardService.liveStatus,
  });
}

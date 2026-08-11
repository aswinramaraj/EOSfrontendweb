import { useQuery } from "@tanstack/react-query";
import { hostelDashboardService } from "../services/dashboard.service";
import { hostelKeys } from "../query-keys";

export function useHostelDashboardSummary() {
  return useQuery({
    queryKey: hostelKeys.dashboard(),
    queryFn: hostelDashboardService.summary,
  });
}

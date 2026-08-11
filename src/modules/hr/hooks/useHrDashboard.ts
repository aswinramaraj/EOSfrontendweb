import { useQuery } from "@tanstack/react-query";
import { hrDashboardService } from "../services/hr-dashboard.service";
import { hrKeys } from "../query-keys";

export function useHrDashboard() {
  return useQuery({
    queryKey: hrKeys.dashboard(),
    queryFn: hrDashboardService.summary,
  });
}

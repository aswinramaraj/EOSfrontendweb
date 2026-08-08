import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import { advisorKeys } from "../query-keys";

export function useAdvisorDashboard() {
  return useQuery({
    queryKey: advisorKeys.dashboard(),
    queryFn: () => dashboardService.get(),
  });
}

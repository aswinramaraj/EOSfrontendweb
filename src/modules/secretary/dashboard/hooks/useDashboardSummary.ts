import { useQuery } from "@tanstack/react-query";
import { secretaryDashboardService } from "../services/dashboard.service";
import { secretaryDashboardKeys } from "../query-keys";

export function useSecretaryDashboardSummary() {
  return useQuery({
    queryKey: secretaryDashboardKeys.summary(),
    queryFn: secretaryDashboardService.summary,
  });
}

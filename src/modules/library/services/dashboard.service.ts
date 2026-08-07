import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { DashboardSummary } from "../types";

export const dashboardService = {
  summary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>("/library/dashboard/summary", requireToken());
  },
};

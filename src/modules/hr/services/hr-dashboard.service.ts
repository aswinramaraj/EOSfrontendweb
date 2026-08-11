import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { HrDashboardSummary } from "../types/api";

export const hrDashboardService = {
  summary(): Promise<HrDashboardSummary> {
    return apiClient.get<HrDashboardSummary>("/hr/dashboard", requireToken());
  },
};

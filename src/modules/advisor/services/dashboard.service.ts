import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { AdvisorDashboard } from "../types";

export const dashboardService = {
  get(): Promise<AdvisorDashboard> {
    return apiClient.get<AdvisorDashboard>("/me/advisor/dashboard", requireToken());
  },
};

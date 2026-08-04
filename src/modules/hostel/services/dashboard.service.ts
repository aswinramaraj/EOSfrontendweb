import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { DashboardSummary } from "../types";

export const hostelDashboardService = {
  summary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>("/hostel/dashboard/summary", requireToken());
  },
};

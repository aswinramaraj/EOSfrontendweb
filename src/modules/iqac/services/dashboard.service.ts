import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { DashboardLiveStatus, DashboardSummary } from "../types/venue-booking";

export const iqacDashboardService = {
  summary(): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>("/venues/dashboard/summary", requireToken());
  },
  liveStatus(): Promise<DashboardLiveStatus> {
    return apiClient.get<DashboardLiveStatus>("/venues/dashboard/live-status", requireToken());
  },
};

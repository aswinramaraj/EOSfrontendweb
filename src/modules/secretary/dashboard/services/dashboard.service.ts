import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { SecretaryDashboardSummary } from "../types";

export const secretaryDashboardService = {
  summary(): Promise<SecretaryDashboardSummary> {
    return apiClient.get<SecretaryDashboardSummary>(
      "/me/secretary/dashboard/summary",
      requireToken(),
    );
  },
};

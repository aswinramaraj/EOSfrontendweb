import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { FinanceOverview, Paginated } from "../types";

export const adminDashboardService = {
  /** GET /api/v1/finance-overview — admin only. Real, working today. */
  financeOverview(): Promise<FinanceOverview> {
    return apiClient.get<FinanceOverview>("/finance-overview", requireToken());
  },

  /**
   * GET /api/v1/me/faculty — admin/hod only. Only `meta.total` is used here
   * (a headcount), so page size is kept at 1 to avoid pulling faculty rows
   * the dashboard doesn't render.
   */
  facultyCount(): Promise<Paginated<unknown>> {
    return apiClient.get<Paginated<unknown>>("/me/faculty?page=1&limit=1", requireToken());
  },
};

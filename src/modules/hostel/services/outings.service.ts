import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type { Outing, OutingDecision, OutingListParams } from "../types/outings";

export const outingsService = {
  list(params: OutingListParams = {}): Promise<Paginated<Outing>> {
    return apiClient.get<Paginated<Outing>>(
      `/hostel/outings${buildQuery(params)}`,
      requireToken(),
    );
  },
  decide(id: number, decision: OutingDecision): Promise<Outing> {
    return apiClient.patch<Outing>(
      `/hostel/outings/${id}/decision`,
      { decision },
      requireToken(),
    );
  },
};

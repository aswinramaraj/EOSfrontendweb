import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type { Resident, ResidentListParams } from "../types/residents";

export const residentsService = {
  list(params: ResidentListParams = {}): Promise<Paginated<Resident>> {
    return apiClient.get<Paginated<Resident>>(
      `/hostel/residents${buildQuery(params)}`,
      requireToken(),
    );
  },
};

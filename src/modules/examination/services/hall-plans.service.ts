import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type { FindHallPlansParams, HallPlan } from "../types/invigilation";

export const hallPlansService = {
  list(params: FindHallPlansParams): Promise<Paginated<HallPlan>> {
    return apiClient.get<Paginated<HallPlan>>(`/hall-plans${buildQuery(params)}`, requireToken());
  },
};

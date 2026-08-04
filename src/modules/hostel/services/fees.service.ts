import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type { HostelFeeListParams, HostelFeeRow } from "../types/fees";

export const hostelFeesService = {
  list(params: HostelFeeListParams = {}): Promise<Paginated<HostelFeeRow>> {
    return apiClient.get<Paginated<HostelFeeRow>>(
      `/hostel/fees${buildQuery(params)}`,
      requireToken(),
    );
  },
};

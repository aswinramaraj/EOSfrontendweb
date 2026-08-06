import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "@/modules/examination/types";
import type { VenueAvailability } from "../types";

export interface VenueListParams {
  from: string;
  to: string;
  page?: number;
  limit?: number;
}

// GET /venues doubles as an availability check — from/to are required, and
// each row comes back with is_available/booking for that exact window.
export const venuesService = {
  list(params: VenueListParams): Promise<Paginated<VenueAvailability>> {
    return apiClient.get<Paginated<VenueAvailability>>(
      `/venues${buildQuery(params)}`,
      requireToken(),
    );
  },
};

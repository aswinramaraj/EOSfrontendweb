import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type { Rack, RackInput } from "../types/racks";

export interface RackListParams {
  q?: string;
  page?: number;
  page_size?: number;
}

export const racksService = {
  list(params: RackListParams = {}): Promise<Paginated<Rack>> {
    return apiClient.get<Paginated<Rack>>(
      `/library/racks${buildQuery(params)}`,
      requireToken(),
    );
  },
  create(input: RackInput): Promise<Rack> {
    return apiClient.post<Rack>("/library/racks", input, requireToken());
  },
  update(id: number, input: Partial<RackInput>): Promise<Rack> {
    return apiClient.patch<Rack>(`/library/racks/${id}`, input, requireToken());
  },
  remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/library/racks/${id}`, requireToken());
  },
};

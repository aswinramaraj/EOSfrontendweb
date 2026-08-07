import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type {
  CreateEResourceInput,
  EResource,
  EResourceListParams,
  EResourceSearchResult,
  UpdateEResourceInput,
} from "../types/e-resources";

export const eResourcesService = {
  list(params: EResourceListParams = {}): Promise<Paginated<EResource>> {
    return apiClient.get<Paginated<EResource>>(
      `/library/e-resources${buildQuery(params)}`,
      requireToken(),
    );
  },
  search(q: string, limit?: number): Promise<EResourceSearchResult[]> {
    return apiClient.get<EResourceSearchResult[]>(
      `/library/e-resources/search${buildQuery({ q, limit })}`,
      requireToken(),
    );
  },
  get(id: number): Promise<EResource> {
    return apiClient.get<EResource>(`/library/e-resources/${id}`, requireToken());
  },
  create(input: CreateEResourceInput): Promise<EResource> {
    return apiClient.post<EResource>("/library/e-resources", input, requireToken());
  },
  update(id: number, input: UpdateEResourceInput): Promise<EResource> {
    return apiClient.patch<EResource>(`/library/e-resources/${id}`, input, requireToken());
  },
  remove(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/library/e-resources/${id}`, requireToken());
  },
};

import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { CreateMediaRequestInput, MediaRequest, MediaRequestStatus, PaginatedResult } from "../types";

export const mediaRequestService = {
  list(status?: MediaRequestStatus): Promise<PaginatedResult<MediaRequest>> {
    return apiClient.get<PaginatedResult<MediaRequest>>(
      `/me/media-requests${buildQuery({ status, limit: 100 })}`,
      requireToken(),
    );
  },
  create(input: CreateMediaRequestInput): Promise<MediaRequest> {
    return apiClient.post<MediaRequest>("/me/media-requests", input, requireToken());
  },
  remove(id: number): Promise<{ id: number; deleted: boolean }> {
    return apiClient.delete<{ id: number; deleted: boolean }>(
      `/me/media-requests/${id}`,
      requireToken(),
    );
  },
};

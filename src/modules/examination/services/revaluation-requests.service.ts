import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  RevaluationRequest,
  RevaluationStatus,
  UpdateRevaluationInput,
} from "../types/revaluation";

// GET /revaluation-requests filters only by `status` — there is no exam_id
// query param on the backend, so per-exam counts/filters happen client-side.
export const revaluationRequestsService = {
  list(status?: RevaluationStatus): Promise<RevaluationRequest[]> {
    return apiClient.get<RevaluationRequest[]>(
      `/revaluation-requests${buildQuery({ status })}`,
      requireToken(),
    );
  },
  update(id: number, input: UpdateRevaluationInput): Promise<RevaluationRequest> {
    return apiClient.patch<RevaluationRequest>(`/revaluation-requests/${id}`, input, requireToken());
  },
};

import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { ApiPaginated, AppraisalRequest, AppraisalRequestsListParams } from "../types/api";

export const appraisalRequestsService = {
  list(params: AppraisalRequestsListParams = {}): Promise<ApiPaginated<AppraisalRequest>> {
    return apiClient.get<ApiPaginated<AppraisalRequest>>(
      `/me/appraisal_requests${buildQuery(params)}`,
      requireToken(),
    );
  },
  get(id: number): Promise<AppraisalRequest> {
    return apiClient.get<AppraisalRequest>(`/me/appraisal_requests/${id}`, requireToken());
  },
  /** HR-only transitions: hr_scored (with entry scores), management_approved, rejected. */
  scoreAndTransition(
    id: number,
    entries: { entry_id: number; score: number }[],
  ): Promise<AppraisalRequest> {
    return apiClient.patch<AppraisalRequest>(
      `/me/appraisal_requests/${id}`,
      { status: "hr_scored", entries },
      requireToken(),
    );
  },
  approve(id: number): Promise<AppraisalRequest> {
    return apiClient.patch<AppraisalRequest>(
      `/me/appraisal_requests/${id}`,
      { status: "management_approved" },
      requireToken(),
    );
  },
  reject(id: number): Promise<AppraisalRequest> {
    return apiClient.patch<AppraisalRequest>(
      `/me/appraisal_requests/${id}`,
      { status: "rejected" },
      requireToken(),
    );
  },
};

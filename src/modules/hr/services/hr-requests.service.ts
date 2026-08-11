import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { ApiPaginated, CreateHrVacationEntryInput, HrRequestsListParams, HrUnifiedRequest } from "../types/api";

export const hrRequestsService = {
  list(params: HrRequestsListParams = {}): Promise<ApiPaginated<HrUnifiedRequest>> {
    return apiClient.get<ApiPaginated<HrUnifiedRequest>>(
      `/hr/requests${buildQuery(params)}`,
      requireToken(),
    );
  },
  /**
   * HR only ever sets hr_approval_status here (HOD approval happens in a
   * different portal). The backend requires hod_approval_status to already
   * be 'approved' before this succeeds — callers should disable the action
   * until then rather than relying solely on the resulting 409.
   */
  decide(
    kind: "leave" | "od",
    sourceId: number,
    decision: "approved" | "rejected",
  ): Promise<HrUnifiedRequest> {
    const path =
      kind === "leave"
        ? `/me/faculty-leaves/${sourceId}`
        : `/me/faculty-od-requests/${sourceId}`;
    return apiClient.patch(path, { hr_approval_status: decision }, requireToken());
  },
  /** HR recording a single-day leave/OD entry directly, e.g. from the Vacation Management calendar. */
  create(input: CreateHrVacationEntryInput): Promise<HrUnifiedRequest> {
    return apiClient.post<HrUnifiedRequest>("/hr/requests", input, requireToken());
  },
  remove(kind: "leave" | "od", sourceId: number): Promise<{ id: number; kind: string; deleted: boolean }> {
    return apiClient.delete(`/hr/requests/${kind}/${sourceId}`, requireToken());
  },
};

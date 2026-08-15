import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { ApiPaginated, PayslipRequest, PayslipRequestsListParams, UpdatePayslipRequestInput } from "../types/api";

export const payslipRequestsService = {
  list(params: PayslipRequestsListParams = {}): Promise<ApiPaginated<PayslipRequest>> {
    return apiClient.get<ApiPaginated<PayslipRequest>>(`/me/payslip-requests${buildQuery(params)}`, requireToken());
  },
  update(id: number, input: UpdatePayslipRequestInput): Promise<PayslipRequest> {
    return apiClient.patch<PayslipRequest>(`/me/payslip-requests/${id}`, input, requireToken());
  },
};

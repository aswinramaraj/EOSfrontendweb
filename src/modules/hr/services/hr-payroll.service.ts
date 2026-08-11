import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  ApiPaginated,
  CreateHrPayrollInput,
  HrPayrollListParams,
  HrPayrollRecord,
} from "../types/api";

export const hrPayrollService = {
  list(params: HrPayrollListParams = {}): Promise<ApiPaginated<HrPayrollRecord>> {
    return apiClient.get<ApiPaginated<HrPayrollRecord>>(
      `/me/hr-payroll${buildQuery(params)}`,
      requireToken(),
    );
  },
  create(input: CreateHrPayrollInput): Promise<HrPayrollRecord> {
    return apiClient.post<HrPayrollRecord>("/me/hr-payroll", input, requireToken());
  },
  markPaid(id: number, paidOn: string): Promise<HrPayrollRecord> {
    return apiClient.patch<HrPayrollRecord>(
      `/me/hr-payroll/${id}`,
      { paid_on: paidOn },
      requireToken(),
    );
  },
};

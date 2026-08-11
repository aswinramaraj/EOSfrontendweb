import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { HrDepartmentRollup } from "../types/api";

export const hrDepartmentsService = {
  list(): Promise<HrDepartmentRollup[]> {
    return apiClient.get<HrDepartmentRollup[]>("/hr/departments", requireToken());
  },
  get(id: number): Promise<HrDepartmentRollup> {
    return apiClient.get<HrDepartmentRollup>(`/hr/departments/${id}`, requireToken());
  },
};

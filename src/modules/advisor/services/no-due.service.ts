import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { NoDueStudent, PaginatedResponse } from "../types";

export interface NoDueListParams {
  batch_id?: number;
  status?: "cleared" | "pending";
  search?: string;
  page?: number;
  limit?: number;
}

export const noDueService = {
  list(params: NoDueListParams = {}): Promise<PaginatedResponse<NoDueStudent>> {
    return apiClient.get<PaginatedResponse<NoDueStudent>>(
      `/me/no-due/mentee-students${buildQuery(params)}`,
      requireToken(),
    );
  },
  approve(studentId: number): Promise<{ student_id: number; override_approved: boolean }> {
    return apiClient.post<{ student_id: number; override_approved: boolean }>(
      `/me/no-due/mentee-students/${studentId}/approve`,
      undefined,
      requireToken(),
    );
  },
  reject(studentId: number): Promise<{ student_id: number; override_approved: boolean }> {
    return apiClient.post<{ student_id: number; override_approved: boolean }>(
      `/me/no-due/mentee-students/${studentId}/reject`,
      undefined,
      requireToken(),
    );
  },
};

import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { OdApprovalStatus, PaginatedResponse, StudentOd } from "../types";

export interface OdListParams {
  status?: OdApprovalStatus;
  page?: number;
  limit?: number;
}

export const odsService = {
  // Real route: GET /me/student-ods — StudentOdsController is @Controller('me').
  list(params: OdListParams = {}): Promise<PaginatedResponse<StudentOd>> {
    return apiClient.get<PaginatedResponse<StudentOd>>(
      `/me/student-ods${buildQuery(params)}`,
      requireToken(),
    );
  },
  facultyApprove(id: number, decision: "approved" | "rejected"): Promise<StudentOd> {
    return apiClient.patch<StudentOd>(
      `/me/student-ods/${id}/faculty-approve`,
      { decision },
      requireToken(),
    );
  },
};

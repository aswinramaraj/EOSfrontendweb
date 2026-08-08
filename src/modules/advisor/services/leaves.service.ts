import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { LeaveStatus, PaginatedResponse, StudentLeave } from "../types";

export interface LeaveListParams {
  status?: LeaveStatus;
  page?: number;
  limit?: number;
}

export const leavesService = {
  // Real route: GET /me/student-leaves — StudentLeavesController is @Controller('me').
  list(params: LeaveListParams = {}): Promise<PaginatedResponse<StudentLeave>> {
    return apiClient.get<PaginatedResponse<StudentLeave>>(
      `/me/student-leaves${buildQuery(params)}`,
      requireToken(),
    );
  },
  facultyApprove(id: number, decision: "approved" | "rejected"): Promise<StudentLeave> {
    return apiClient.patch<StudentLeave>(
      `/me/student-leaves/${id}/faculty-approve`,
      { decision },
      requireToken(),
    );
  },
};

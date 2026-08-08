import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { AttendanceRecord, MarkClassAttendanceInput, PaginatedResponse } from "../types";

export interface AttendanceListParams {
  class_id?: number;
  student_id?: number;
  date?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export const attendanceService = {
  // Real route: GET /me/attendance — AttendanceController is @Controller('me').
  list(params: AttendanceListParams): Promise<PaginatedResponse<AttendanceRecord>> {
    return apiClient.get<PaginatedResponse<AttendanceRecord>>(
      `/me/attendance${buildQuery(params)}`,
      requireToken(),
    );
  },
  markForClass(classId: number, input: MarkClassAttendanceInput): Promise<AttendanceRecord[]> {
    return apiClient.post<AttendanceRecord[]>(
      `/me/classes/${classId}/attendance`,
      input,
      requireToken(),
    );
  },
};

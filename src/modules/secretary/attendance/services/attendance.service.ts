import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  AttendanceRecordSummary,
  CreateAttendanceInput,
  CreateAttendanceResult,
  PaginatedResult,
  RosterStudent,
} from "../types";

export const attendanceService = {
  getRoster(classId: number): Promise<RosterStudent[]> {
    return apiClient.get<RosterStudent[]>(
      `/me/classes/${classId}/roster`,
      requireToken(),
    );
  },

  listForClassAndDate(classId: number, date: string): Promise<PaginatedResult<AttendanceRecordSummary>> {
    return apiClient.get<PaginatedResult<AttendanceRecordSummary>>(
      `/me/attendance${buildQuery({ class_id: classId, date, limit: 500 })}`,
      requireToken(),
    );
  },

  create(input: CreateAttendanceInput): Promise<CreateAttendanceResult> {
    return apiClient.post<CreateAttendanceResult>("/me/attendance", input, requireToken());
  },
};

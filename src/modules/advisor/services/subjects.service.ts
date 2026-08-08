import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { MappingSubject, PaginatedResponse } from "../types";

export const subjectsService = {
  // Real route: GET /me/faculty-mapping — the subjects this faculty member
  // is mapped to teach for a given class (used for attendance/marks entry,
  // where the subject teacher — not necessarily the class mentor — enters data).
  listForClass(facultyId: number, classId: number): Promise<PaginatedResponse<MappingSubject>> {
    return apiClient.get<PaginatedResponse<MappingSubject>>(
      `/me/faculty-mapping${buildQuery({ faculty_id: facultyId, class_id: classId, limit: 100 })}`,
      requireToken(),
    );
  },
};

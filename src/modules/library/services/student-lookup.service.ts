import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { NoDuesCheck, StudentSearchResult } from "../types/student-lookup";

export const studentLookupService = {
  // Fuzzy search — backend requires q.length >= 2.
  search(q: string, limit?: number): Promise<StudentSearchResult[]> {
    return apiClient.get<StudentSearchResult[]>(
      `/library/students/search${buildQuery({ q, limit })}`,
      requireToken(),
    );
  },
  noDuesCheck(studentId: number): Promise<NoDuesCheck> {
    return apiClient.get<NoDuesCheck>(
      `/library/students/${studentId}/no-dues-check`,
      requireToken(),
    );
  },
};

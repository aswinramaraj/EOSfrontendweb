import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { FacultyMappingListParams, FacultyMappingListResponse } from "../types/faculty-mapping";

// Verified live: GET /api/v1/faculty-mapping -> 404, GET /api/v1/me/faculty-mapping
// -> 401 (route exists, guarded) — same /me/ prefix quirk as faculty.service.ts.
const BASE = "/me/faculty-mapping";

export const facultyMappingService = {
  list(params: FacultyMappingListParams = {}): Promise<FacultyMappingListResponse> {
    return apiClient.get<FacultyMappingListResponse>(`${BASE}${buildQuery(params)}`, requireToken());
  },
};

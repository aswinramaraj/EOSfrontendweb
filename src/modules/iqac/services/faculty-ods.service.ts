import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types/common";
import type { FacultyOd, FacultyOdListParams, VerifyOdInput } from "../types/od";

export const facultyOdsService = {
  list(params: FacultyOdListParams = {}): Promise<Paginated<FacultyOd>> {
    return apiClient.get<Paginated<FacultyOd>>(
      `/me/faculty-od${buildQuery(params)}`,
      requireToken(),
    );
  },
  verify(id: number, input: VerifyOdInput): Promise<FacultyOd> {
    return apiClient.patch<FacultyOd>(`/me/faculty-od/${id}/verify`, input, requireToken());
  },
};

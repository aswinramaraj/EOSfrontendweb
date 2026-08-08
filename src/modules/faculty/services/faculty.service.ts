import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  Faculty,
  FacultyListParams,
  FacultyOwnProfile,
  PaginatedResponse,
  UpdateOwnProfileInput,
} from "../types";

export const facultyService = {
  // Real route is /me/faculty — FacultyController is @Controller('me').
  list(params: FacultyListParams = {}): Promise<PaginatedResponse<Faculty>> {
    return apiClient.get<PaginatedResponse<Faculty>>(
      `/me/faculty${buildQuery(params)}`,
      requireToken(),
    );
  },
  getOwnProfile(): Promise<FacultyOwnProfile> {
    return apiClient.get<FacultyOwnProfile>("/me/profile", requireToken());
  },
  updateOwnProfile(input: UpdateOwnProfileInput): Promise<FacultyOwnProfile> {
    return apiClient.patch<FacultyOwnProfile>("/me/profile", input, requireToken());
  },
};

import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  CreateFacultyInput,
  Faculty,
  FacultyActivityEntry,
  FacultyAttendanceOverview,
  FacultyAttendanceOverviewParams,
  FacultyAttendanceSummary,
  FacultyListParams,
  FacultyListResponse,
  UpdateFacultyInput,
} from "../types";

// The Swagger UI's summary text for these endpoints says e.g.
// "POST /api/v1/faculty", but that path 404s live — the actually-registered
// route is under /me/faculty (confirmed: GET /api/v1/faculty -> 404,
// GET /api/v1/me/faculty -> 401 unauthorized-but-exists). See
// admin-faculty-endpoints.md at the repo root for the full writeup.
const BASE = "/me/faculty";

export const facultyService = {
  list(params: FacultyListParams = {}): Promise<FacultyListResponse> {
    return apiClient.get<FacultyListResponse>(`${BASE}${buildQuery(params)}`, requireToken());
  },
  get(id: number): Promise<Faculty> {
    return apiClient.get<Faculty>(`${BASE}/${id}`, requireToken());
  },
  create(input: CreateFacultyInput): Promise<Faculty> {
    return apiClient.post<Faculty>(BASE, input, requireToken());
  },
  update(id: number, input: UpdateFacultyInput): Promise<Faculty> {
    return apiClient.patch<Faculty>(`${BASE}/${id}`, input, requireToken());
  },
  listActivity(id: number): Promise<FacultyActivityEntry[]> {
    return apiClient.get<FacultyActivityEntry[]>(`${BASE}/${id}/activity`, requireToken());
  },
  getAttendance(id: number, academicYear?: string): Promise<FacultyAttendanceSummary> {
    const query = academicYear ? `?academic_year=${encodeURIComponent(academicYear)}` : "";
    return apiClient.get<FacultyAttendanceSummary>(`${BASE}/${id}/attendance${query}`, requireToken());
  },
  getAttendanceOverview(params: FacultyAttendanceOverviewParams = {}): Promise<FacultyAttendanceOverview> {
    return apiClient.get<FacultyAttendanceOverview>(
      `${BASE}/attendance/overview${buildQuery(params)}`,
      requireToken(),
    );
  },
};

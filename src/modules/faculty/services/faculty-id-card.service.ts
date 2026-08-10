import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { FacultyIdCardStatus } from "../types";

const BASE = "/me/faculty";

export const facultyIdCardService = {
  getStatus(facultyId: number): Promise<FacultyIdCardStatus> {
    return apiClient.get<FacultyIdCardStatus>(`${BASE}/${facultyId}/id-card`, requireToken());
  },
  getBulkStatus(facultyIds: number[]): Promise<Record<number, FacultyIdCardStatus>> {
    return apiClient.get<Record<number, FacultyIdCardStatus>>(
      `${BASE}/id-card/status?faculty_ids=${facultyIds.join(",")}`,
      requireToken(),
    );
  },
  issue(facultyId: number): Promise<FacultyIdCardStatus> {
    return apiClient.post<FacultyIdCardStatus>(`${BASE}/${facultyId}/id-card/issue`, undefined, requireToken());
  },
};

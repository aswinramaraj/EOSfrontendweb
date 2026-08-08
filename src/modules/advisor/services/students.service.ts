import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  MenteeClass,
  MenteeClassMarks,
  MenteeClassResult,
  MenteePlacement,
  MenteeProfile,
  MenteeReport,
} from "../types";

export const studentsService = {
  listMenteeClasses(): Promise<MenteeClass[]> {
    return apiClient.get<MenteeClass[]>("/me/mentee-classes", requireToken());
  },
  getClassResult(classId: number): Promise<MenteeClassResult> {
    return apiClient.get<MenteeClassResult>(
      `/me/mentee-classes/${classId}/students`,
      requireToken(),
    );
  },
  getClassMarks(classId: number, examTypeId?: number): Promise<MenteeClassMarks> {
    return apiClient.get<MenteeClassMarks>(
      `/me/mentee-classes/${classId}/marks${buildQuery({ exam_type_id: examTypeId })}`,
      requireToken(),
    );
  },
  getProfile(studentId: number): Promise<MenteeProfile> {
    return apiClient.get<MenteeProfile>(`/me/mentees/${studentId}/profile`, requireToken());
  },
  getReport(studentId: number): Promise<MenteeReport> {
    return apiClient.get<MenteeReport>(`/me/mentees/${studentId}/report`, requireToken());
  },
  getPlacements(studentId: number): Promise<MenteePlacement[]> {
    return apiClient.get<MenteePlacement[]>(
      `/me/mentees/${studentId}/placements`,
      requireToken(),
    );
  },
};

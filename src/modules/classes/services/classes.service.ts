import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { AssignMentorInput, ClassSummary, MentorAssignment } from "../types";

export const classesService = {
  list(): Promise<ClassSummary[]> {
    return apiClient.get<ClassSummary[]>("/classes", requireToken());
  },
  assignMentor(classId: number, input: AssignMentorInput): Promise<MentorAssignment> {
    return apiClient.post<MentorAssignment>(
      `/classes/${classId}/mentor`,
      input,
      requireToken(),
    );
  },
};

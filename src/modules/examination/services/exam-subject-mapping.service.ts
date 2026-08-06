import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type {
  ExamSubjectMapping,
  MapSubjectsInput,
  MapSubjectsResult,
} from "../types/exam-subject-mapping";

// GET /exam-subject-mapping returns every mapping, unfiltered — filter
// client-side by exam_id (the backend does no query filtering here).
export const examSubjectMappingService = {
  list(): Promise<ExamSubjectMapping[]> {
    return apiClient.get<ExamSubjectMapping[]>("/exam-subject-mapping", requireToken());
  },
  map(input: MapSubjectsInput): Promise<MapSubjectsResult> {
    return apiClient.post<MapSubjectsResult>("/exam-subject-mapping", input, requireToken());
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/exam-subject-mapping/${id}`, requireToken());
  },
};

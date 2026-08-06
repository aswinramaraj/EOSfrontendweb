import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { CreateMarkInput, ExamMark, UpdateMarkInput } from "../types/marks";

// GET /exam-marks returns the entire table, unfiltered — filter client-side
// by exam_subject_mapping.exam_id / .class_id (the backend does no query
// filtering on this resource).
export const marksService = {
  list(): Promise<ExamMark[]> {
    return apiClient.get<ExamMark[]>("/exam-marks", requireToken());
  },
  create(input: CreateMarkInput): Promise<ExamMark> {
    return apiClient.post<ExamMark>("/exam-marks", input, requireToken());
  },
  update(id: number, input: UpdateMarkInput): Promise<ExamMark> {
    return apiClient.patch<ExamMark>(`/exam-marks/${id}`, input, requireToken());
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/exam-marks/${id}`, requireToken());
  },
};

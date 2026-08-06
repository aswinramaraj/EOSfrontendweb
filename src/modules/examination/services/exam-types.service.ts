import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { CreateExamTypeInput, ExamType, UpdateExamTypeInput } from "../types/exams";

export const examTypesService = {
  list(): Promise<ExamType[]> {
    return apiClient.get<ExamType[]>("/exam-types", requireToken());
  },
  create(input: CreateExamTypeInput): Promise<ExamType> {
    return apiClient.post<ExamType>("/exam-types", input, requireToken());
  },
  update(id: number, input: UpdateExamTypeInput): Promise<ExamType> {
    return apiClient.patch<ExamType>(`/exam-types/${id}`, input, requireToken());
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/exam-types/${id}`, requireToken());
  },
};

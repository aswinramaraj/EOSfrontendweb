import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { CreateExamInput, Exam, UpdateExamInput } from "../types/exams";

// GET /exams takes no query params and returns every exam — filter/sort
// client-side (the backend does no pagination or filtering on this resource).
export const examsService = {
  list(): Promise<Exam[]> {
    return apiClient.get<Exam[]>("/exams", requireToken());
  },
  get(id: number): Promise<Exam> {
    return apiClient.get<Exam>(`/exams/${id}`, requireToken());
  },
  create(input: CreateExamInput): Promise<Exam> {
    return apiClient.post<Exam>("/exams", input, requireToken());
  },
  update(id: number, input: UpdateExamInput): Promise<Exam> {
    return apiClient.patch<Exam>(`/exams/${id}`, input, requireToken());
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/exams/${id}`, requireToken());
  },
  complete(id: number): Promise<Exam> {
    return apiClient.post<Exam>(`/exams/${id}/complete`, undefined, requireToken());
  },
};

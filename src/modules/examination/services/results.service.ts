import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { DepartmentPassRate, RankHolder, ResultPublication, ResultsSummary } from "../types/results";

export const examResultsService = {
  listPublications(): Promise<ResultPublication[]> {
    return apiClient.get<ResultPublication[]>("/results", requireToken());
  },
  getSummary(examId: number): Promise<ResultsSummary> {
    return apiClient.get<ResultsSummary>(`/exams/${examId}/results/summary`, requireToken());
  },
  getPassRateByDepartment(examId: number): Promise<DepartmentPassRate[]> {
    return apiClient.get<DepartmentPassRate[]>(
      `/exams/${examId}/results/pass-rate-by-department`,
      requireToken(),
    );
  },
  getRankHolders(examId: number, limit?: number): Promise<RankHolder[]> {
    return apiClient.get<RankHolder[]>(
      `/exams/${examId}/results/rank-holders${buildQuery({ limit })}`,
      requireToken(),
    );
  },
  publish(examId: number): Promise<ResultPublication> {
    return apiClient.post<ResultPublication>(`/exams/${examId}/results/publish`, undefined, requireToken());
  },
};

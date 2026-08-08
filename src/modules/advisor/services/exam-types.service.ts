import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { ExamType } from "../types";

export const examTypesService = {
  list(): Promise<ExamType[]> {
    return apiClient.get<ExamType[]>("/exam-types", requireToken());
  },
};

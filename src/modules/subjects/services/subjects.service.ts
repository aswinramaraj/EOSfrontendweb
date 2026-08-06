import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { SubjectRef } from "../types";

export const subjectsService = {
  list(): Promise<SubjectRef[]> {
    return apiClient.get<SubjectRef[]>("/subjects", requireToken());
  },
};

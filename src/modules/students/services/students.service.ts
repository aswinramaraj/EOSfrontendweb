import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { ListStudentsParams, StudentsListResponse } from "../types";

export const studentsService = {
  findAll(params: ListStudentsParams = {}): Promise<StudentsListResponse> {
    return apiClient.get<StudentsListResponse>(`/students${buildQuery(params)}`, requireToken());
  },
};

import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types/common";
import type { StudentOdDetail, StudentOdListItem, StudentOdListParams, VerifyOdInput } from "../types/od";

export const studentOdsService = {
  list(params: StudentOdListParams = {}): Promise<Paginated<StudentOdListItem>> {
    return apiClient.get<Paginated<StudentOdListItem>>(
      `/iqac/student-ods${buildQuery(params)}`,
      requireToken(),
    );
  },
  get(id: number): Promise<StudentOdDetail> {
    return apiClient.get<StudentOdDetail>(`/iqac/student-ods/${id}`, requireToken());
  },
  verify(id: number, input: VerifyOdInput): Promise<StudentOdDetail> {
    return apiClient.patch<StudentOdDetail>(
      `/iqac/student-ods/${id}/verify`,
      input,
      requireToken(),
    );
  },
};

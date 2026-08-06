import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type {
  CreateMalpracticeIncidentInput,
  FindMalpracticeParams,
  MalpracticeIncident,
  UpdateMalpracticeIncidentInput,
} from "../types/malpractice";

export const malpracticeService = {
  list(params: FindMalpracticeParams): Promise<Paginated<MalpracticeIncident>> {
    return apiClient.get<Paginated<MalpracticeIncident>>(
      `/malpractice-incidents${buildQuery(params)}`,
      requireToken(),
    );
  },
  create(input: CreateMalpracticeIncidentInput): Promise<MalpracticeIncident> {
    return apiClient.post<MalpracticeIncident>("/malpractice-incidents", input, requireToken());
  },
  update(id: number, input: UpdateMalpracticeIncidentInput): Promise<MalpracticeIncident> {
    return apiClient.patch<MalpracticeIncident>(`/malpractice-incidents/${id}`, input, requireToken());
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/malpractice-incidents/${id}`, requireToken());
  },
};

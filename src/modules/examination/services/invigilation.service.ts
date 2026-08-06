import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type {
  CreateInvigilationDutyInput,
  FacultyWorkload,
  FindInvigilationParams,
  InvigilationDuty,
  UpdateInvigilationDutyInput,
} from "../types/invigilation";

export const invigilationService = {
  list(params: FindInvigilationParams): Promise<Paginated<InvigilationDuty>> {
    return apiClient.get<Paginated<InvigilationDuty>>(
      `/invigilation${buildQuery(params)}`,
      requireToken(),
    );
  },
  getFacultyWorkload(facultyId: number): Promise<FacultyWorkload> {
    return apiClient.get<FacultyWorkload>(
      `/invigilation/faculty/${facultyId}/workload`,
      requireToken(),
    );
  },
  create(input: CreateInvigilationDutyInput): Promise<InvigilationDuty> {
    return apiClient.post<InvigilationDuty>("/invigilation", input, requireToken());
  },
  update(id: number, input: UpdateInvigilationDutyInput): Promise<InvigilationDuty> {
    return apiClient.patch<InvigilationDuty>(`/invigilation/${id}`, input, requireToken());
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/invigilation/${id}`, requireToken());
  },
};

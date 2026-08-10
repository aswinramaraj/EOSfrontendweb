import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  ApiPaginated,
  AppraisalCriteriaListParams,
  AppraisalCriterion,
  AppraisalDivision,
  CreateAppraisalCriterionInput,
} from "../types/api";

export const appraisalCriteriaService = {
  listDivisions(): Promise<AppraisalDivision[]> {
    return apiClient.get<AppraisalDivision[]>("/appraisal-divisions", requireToken());
  },
  createDivision(name: string): Promise<AppraisalDivision> {
    return apiClient.post<AppraisalDivision>("/appraisal-divisions", { name }, requireToken());
  },
  list(params: AppraisalCriteriaListParams = {}): Promise<ApiPaginated<AppraisalCriterion>> {
    return apiClient.get<ApiPaginated<AppraisalCriterion>>(
      `/appraisal-criteria${buildQuery(params)}`,
      requireToken(),
    );
  },
  create(input: CreateAppraisalCriterionInput): Promise<AppraisalCriterion> {
    return apiClient.post<AppraisalCriterion>("/appraisal-criteria", input, requireToken());
  },
  update(
    id: number,
    input: Partial<CreateAppraisalCriterionInput>,
  ): Promise<AppraisalCriterion> {
    return apiClient.patch<AppraisalCriterion>(
      `/appraisal-criteria/${id}`,
      input,
      requireToken(),
    );
  },
  remove(id: number): Promise<{ id: number; deleted: boolean }> {
    return apiClient.delete<{ id: number; deleted: boolean }>(
      `/appraisal-criteria/${id}`,
      requireToken(),
    );
  },
};

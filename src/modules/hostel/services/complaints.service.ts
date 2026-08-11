import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type {
  Complaint,
  ComplaintListParams,
  CreateComplaintInput,
  UpdateComplaintInput,
} from "../types/complaints";

export const complaintsService = {
  list(params: ComplaintListParams = {}): Promise<Paginated<Complaint>> {
    return apiClient.get<Paginated<Complaint>>(
      `/hostel/complaints${buildQuery(params)}`,
      requireToken(),
    );
  },
  create(input: CreateComplaintInput): Promise<Complaint> {
    return apiClient.post<Complaint>("/hostel/complaints", input, requireToken());
  },
  update(id: number, input: UpdateComplaintInput): Promise<Complaint> {
    return apiClient.patch<Complaint>(`/hostel/complaints/${id}`, input, requireToken());
  },
};

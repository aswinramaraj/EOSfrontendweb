import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  CreateServiceRequestInput,
  PaginatedResult,
  ServiceRequest,
  ServiceRequestStatus,
  UpdateServiceRequestInput,
} from "../types/service-request";

export const serviceRequestsService = {
  list(status?: ServiceRequestStatus): Promise<PaginatedResult<ServiceRequest>> {
    return apiClient.get<PaginatedResult<ServiceRequest>>(
      `/me/service-requests${buildQuery({ status, limit: 100 })}`,
      requireToken(),
    );
  },
  create(input: CreateServiceRequestInput): Promise<ServiceRequest> {
    return apiClient.post<ServiceRequest>("/me/service-requests", input, requireToken());
  },
  update(id: number, input: UpdateServiceRequestInput): Promise<ServiceRequest> {
    return apiClient.patch<ServiceRequest>(
      `/me/service-requests/${id}`,
      input,
      requireToken(),
    );
  },
  submit(id: number): Promise<ServiceRequest> {
    return apiClient.post<ServiceRequest>(
      `/me/service-requests/${id}/submit`,
      undefined,
      requireToken(),
    );
  },
  remove(id: number): Promise<{ id: number; deleted: boolean }> {
    return apiClient.delete<{ id: number; deleted: boolean }>(
      `/me/service-requests/${id}`,
      requireToken(),
    );
  },
};

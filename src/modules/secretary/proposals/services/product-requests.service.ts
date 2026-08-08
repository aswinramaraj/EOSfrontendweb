import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { PaginatedResult } from "../types/service-request";
import type {
  CreateProductRequestInput,
  ProductRequest,
  ProductRequestStatus,
  UpdateProductRequestInput,
} from "../types/product-request";

export const productRequestsService = {
  list(status?: ProductRequestStatus): Promise<PaginatedResult<ProductRequest>> {
    return apiClient.get<PaginatedResult<ProductRequest>>(
      `/me/product-requests${buildQuery({ status, limit: 100 })}`,
      requireToken(),
    );
  },
  create(input: CreateProductRequestInput): Promise<ProductRequest> {
    return apiClient.post<ProductRequest>("/me/product-requests", input, requireToken());
  },
  update(id: number, input: UpdateProductRequestInput): Promise<ProductRequest> {
    return apiClient.patch<ProductRequest>(
      `/me/product-requests/${id}`,
      input,
      requireToken(),
    );
  },
  submit(id: number): Promise<ProductRequest> {
    return apiClient.post<ProductRequest>(
      `/me/product-requests/${id}/submit`,
      undefined,
      requireToken(),
    );
  },
  remove(id: number): Promise<{ id: number; deleted: boolean }> {
    return apiClient.delete<{ id: number; deleted: boolean }>(
      `/me/product-requests/${id}`,
      requireToken(),
    );
  },
};

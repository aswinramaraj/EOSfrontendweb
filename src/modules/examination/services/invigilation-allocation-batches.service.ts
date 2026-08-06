import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  CreateAllocationBatchInput,
  InvigilationBatch,
  ListAllocationBatchesParams,
} from "../types/invigilation";

export const invigilationBatchesService = {
  list(params: ListAllocationBatchesParams): Promise<InvigilationBatch[]> {
    return apiClient.get<InvigilationBatch[]>(
      `/invigilation-allocation-batches${buildQuery(params)}`,
      requireToken(),
    );
  },
  // The backend calls this "findOrCreate" — idempotent by exam+date+session,
  // so this doubles as both "create" and "get the existing one" from the UI.
  findOrCreate(input: CreateAllocationBatchInput): Promise<InvigilationBatch> {
    return apiClient.post<InvigilationBatch>("/invigilation-allocation-batches", input, requireToken());
  },
  submit(id: number): Promise<InvigilationBatch> {
    return apiClient.patch<InvigilationBatch>(
      `/invigilation-allocation-batches/${id}/submit`,
      undefined,
      requireToken(),
    );
  },
  publish(id: number): Promise<InvigilationBatch> {
    return apiClient.patch<InvigilationBatch>(
      `/invigilation-allocation-batches/${id}/publish`,
      undefined,
      requireToken(),
    );
  },
  remove(id: number): Promise<null> {
    return apiClient.delete<null>(`/invigilation-allocation-batches/${id}`, requireToken());
  },
};

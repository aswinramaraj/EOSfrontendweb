import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { Batch } from "../types";

export const batchesService = {
  list(): Promise<Batch[]> {
    return apiClient.get<Batch[]>("/batches", requireToken());
  },
};

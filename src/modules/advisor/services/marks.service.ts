import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { BulkMarkInput } from "../types";

export const marksService = {
  bulkUpsert(input: BulkMarkInput): Promise<unknown> {
    return apiClient.post("/exam-marks/bulk", input, requireToken());
  },
};

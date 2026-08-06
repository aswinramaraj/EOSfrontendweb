import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { Quota } from "../types";

export const quotasService = {
  list(): Promise<Quota[]> {
    return apiClient.get<Quota[]>("/quotas", requireToken());
  },
};

import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { Department } from "../types";

export const departmentsService = {
  list(): Promise<Department[]> {
    return apiClient.get<Department[]>("/departments", requireToken());
  },
};

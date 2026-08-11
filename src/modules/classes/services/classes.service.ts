import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { SchoolClass } from "../types";

export const classesService = {
  list(): Promise<SchoolClass[]> {
    return apiClient.get<SchoolClass[]>("/classes", requireToken());
  },
};

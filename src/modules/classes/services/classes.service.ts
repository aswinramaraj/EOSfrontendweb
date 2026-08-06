import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { ClassRef } from "../types";

export const classesService = {
  list(): Promise<ClassRef[]> {
    return apiClient.get<ClassRef[]>("/classes", requireToken());
  },
};

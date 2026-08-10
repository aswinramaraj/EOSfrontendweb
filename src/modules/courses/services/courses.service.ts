import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { Course } from "../types";

export const coursesService = {
  list(): Promise<Course[]> {
    return apiClient.get<Course[]>("/courses", requireToken());
  },
};

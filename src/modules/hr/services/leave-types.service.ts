import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { LeaveType } from "../types/api";

export const leaveTypesService = {
  list(): Promise<LeaveType[]> {
    return apiClient.get<LeaveType[]>("/leave-types", requireToken());
  },
};

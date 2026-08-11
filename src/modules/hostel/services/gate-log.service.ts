import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type { Paginated } from "../types";
import type { CreateGateLogInput, GateLogEntry, GateLogListParams } from "../types/gate-log";

export const gateLogService = {
  list(params: GateLogListParams = {}): Promise<Paginated<GateLogEntry>> {
    return apiClient.get<Paginated<GateLogEntry>>(
      `/hostel/gate-log${buildQuery(params)}`,
      requireToken(),
    );
  },
  create(input: CreateGateLogInput): Promise<GateLogEntry> {
    return apiClient.post<GateLogEntry>("/hostel/gate-log", input, requireToken());
  },
};

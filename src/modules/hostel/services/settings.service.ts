import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { HostelSettings, UpdateHostelSettingsInput } from "../types/settings";

export const hostelSettingsService = {
  get(): Promise<HostelSettings> {
    return apiClient.get<HostelSettings>("/hostel/settings", requireToken());
  },
  update(input: UpdateHostelSettingsInput): Promise<HostelSettings> {
    return apiClient.patch<HostelSettings>("/hostel/settings", input, requireToken());
  },
};

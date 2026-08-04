import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import type { LibrarySettings, UpdateLibrarySettingsInput } from "../types/settings";

export const settingsService = {
  get(): Promise<LibrarySettings> {
    return apiClient.get<LibrarySettings>("/library/settings", requireToken());
  },
  update(input: UpdateLibrarySettingsInput): Promise<LibrarySettings> {
    return apiClient.patch<LibrarySettings>("/library/settings", input, requireToken());
  },
};

import { apiClient } from "@/shared/lib/api-client";
import { requireToken } from "@/shared/lib/auth-token";
import { buildQuery } from "@/shared/lib/query-string";
import type {
  Announcement,
  AnnouncementStatus,
  AssignedClassOption,
  CreateAnnouncementInput,
} from "../types";

export const announcementsService = {
  list(status?: AnnouncementStatus): Promise<Announcement[]> {
    return apiClient.get<Announcement[]>(
      `/announcements${buildQuery({ status })}`,
      requireToken(),
    );
  },
  create(input: CreateAnnouncementInput): Promise<Announcement> {
    return apiClient.post<Announcement>("/announcements", input, requireToken());
  },
  listAssignedClasses(): Promise<AssignedClassOption[]> {
    return apiClient.get<AssignedClassOption[]>(
      "/announcements/lookup/assigned-classes",
      requireToken(),
    );
  },
};

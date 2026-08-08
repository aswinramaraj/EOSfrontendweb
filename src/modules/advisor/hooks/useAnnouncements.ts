import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementsService } from "../services/announcements.service";
import { advisorKeys } from "../query-keys";
import type { AnnouncementStatus, CreateAnnouncementInput } from "../types";

export function useAnnouncements(status?: AnnouncementStatus) {
  return useQuery({
    queryKey: advisorKeys.announcements.list({ status }),
    queryFn: () => announcementsService.list(status),
  });
}

export function useAssignedClasses() {
  return useQuery({
    queryKey: advisorKeys.assignedClasses(),
    queryFn: () => announcementsService.listAssignedClasses(),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnnouncementInput) => announcementsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advisorKeys.announcements.all() });
      queryClient.invalidateQueries({ queryKey: advisorKeys.dashboard() });
    },
  });
}

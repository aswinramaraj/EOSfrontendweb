import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";
import { placementKeys } from "../query-keys";

function useInvalidateNotifications() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: placementKeys.notifications() });
}

export function useMarkAllNotificationsRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: invalidate,
  });
}

export function useMarkNotificationRead() {
  const invalidate = useInvalidateNotifications();
  return useMutation({
    mutationFn: (id: number) => notificationsService.markRead(id),
    onSuccess: invalidate,
  });
}

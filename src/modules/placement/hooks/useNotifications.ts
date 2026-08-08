import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";
import { placementKeys } from "../query-keys";

export function useNotifications() {
  return useQuery({
    queryKey: placementKeys.notifications(),
    queryFn: notificationsService.list,
  });
}

export function useUnreadNotificationsCount() {
  const { data } = useNotifications();
  return data ? data.filter((n) => !n.read).length : 0;
}

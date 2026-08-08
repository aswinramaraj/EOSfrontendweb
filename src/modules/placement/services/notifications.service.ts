import { delay, notifications } from "../data/mock-store";
import type { NotificationItem } from "../types";

export const notificationsService = {
  list(): Promise<NotificationItem[]> {
    return delay(notifications.slice());
  },

  markAllRead(): Promise<NotificationItem[]> {
    notifications.forEach((n) => (n.read = true));
    return delay(notifications.slice());
  },

  markRead(id: number): Promise<NotificationItem[]> {
    const item = notifications.find((n) => n.id === id);
    if (item) item.read = true;
    return delay(notifications.slice());
  },
};

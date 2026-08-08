import type { NotificationItem } from "../types";

// Notifications is the only remaining mock — companies, drives (incl.
// applications), offers, and dashboard/reports (see placement-stats.
// service.ts) are all real now. This starts empty rather than pre-seeded
// with fabricated numbers: the notifications REST endpoints don't exist
// yet, so there's nothing real to show, and nothing here should look like
// it came from a live source.

export function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let nextNotificationId = 1;

export const notifications: NotificationItem[] = [];

export function genNotificationId(): number {
  return nextNotificationId++;
}

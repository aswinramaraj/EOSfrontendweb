"use client";

import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { ApiError } from "@/shared/lib/api-client";
import { useNotifications } from "@/modules/placement/hooks/useNotifications";
import { useMarkAllNotificationsRead, useMarkNotificationRead } from "@/modules/placement/hooks/useNotificationMutations";

export default function NotificationsPage() {
  const { data, isLoading, error } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const unreadCount = data?.filter((n) => !n.read).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread · registration, rounds, results and offers`}
        actions={
          <Button variant="secondary" onClick={() => markAllRead.mutate()} isPending={markAllRead.isPending} disabled={unreadCount === 0}>
            Mark all as read
          </Button>
        }
      />

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof ApiError ? error.message : "Failed to load notifications."}
        </p>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="rounded-lg border border-slate-200 bg-white">
          {data?.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => !item.read && markRead.mutate(item.id)}
              className={`flex w-full items-start justify-between gap-4 px-5 py-4 text-left ${
                i > 0 ? "border-t border-slate-100" : ""
              } ${!item.read ? "bg-blue-50/40" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                  {item.avatarLetter}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{item.message}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{item.timeAgo}</span>
            </button>
          ))}
          {data?.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-500">No notifications yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

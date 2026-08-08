"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/ui/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { StatusPill } from "@/shared/components/ui/StatusPill";
import { PlusIcon } from "@/shared/components/icons";
import { ApiError } from "@/shared/lib/api-client";
import { useAnnouncements } from "../../hooks/useAnnouncements";
import { NewAnnouncementModal } from "./NewAnnouncementModal";

export function AnnouncementsPanel() {
  const { data, isLoading, error } = useAnnouncements("published");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Post updates to the class you mentor."
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <PlusIcon className="h-4 w-4" /> New announcement
          </Button>
        }
      />

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && (
        <p className="text-sm text-red-600">
          {error instanceof ApiError ? error.message : "Failed to load announcements."}
        </p>
      )}

      {!isLoading && !error && (!data || data.length === 0) && (
        <p className="text-sm text-slate-500">No announcements yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data?.map((a) => (
          <div key={a.id} className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <StatusPill tone="blue">{a.target_audience}</StatusPill>
              <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{a.content}</p>
          </div>
        ))}
      </div>

      <NewAnnouncementModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

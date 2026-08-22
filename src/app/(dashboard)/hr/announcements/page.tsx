"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import { SparkleIcon } from "@/shared/components/icons";
import { useAnnouncements } from "@/modules/hr/local/announcements-store";
import { NewAnnouncementModal } from "@/modules/hr/components/NewAnnouncementModal";
import { HRPageHeader } from "@/modules/hr/components/ui/HRPageHeader";
import { HRCard } from "@/modules/hr/components/ui/HRCard";
import { HRPill } from "@/modules/hr/components/ui/HRPill";

function formatPostedAt(timestamp: number): string {
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
  const time = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Today · ${time}`;
  if (isYesterday) return "Yesterday";
  return `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${time}`;
}

export default function HRAnnouncementsPage() {
  const { data: announcements } = useAnnouncements();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <HRPageHeader
        title="Announcements"
        description="Circulars from the institution and posts you publish to staff."
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <SparkleIcon className="h-4 w-4" />
            New announcement
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {announcements.map((announcement) => (
          <HRCard key={announcement.id}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HRPill tone="blue">{announcement.category}</HRPill>
                <span className="text-sm text-slate-500">{formatPostedAt(announcement.postedAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">{announcement.postedBy}</span>
                <HRPill tone={announcement.published ? "blue" : "slate"}>
                  {announcement.published ? "Published" : "Draft"}
                </HRPill>
              </div>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">{announcement.headline}</h3>
            <p className="mt-1.5 text-sm text-slate-700">{announcement.message}</p>
            <p className="mt-3 text-sm text-slate-400">Audience · {announcement.audience.join(", ")}</p>
          </HRCard>
        ))}

        {announcements.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-500">
            No announcements posted yet — use &quot;New announcement&quot; to publish one.
          </p>
        )}
      </div>

      <NewAnnouncementModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
